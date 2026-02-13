from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import asyncio
import json
import re
from typing import Optional

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class CrawlRequest(BaseModel):
    url: str
    max_pages: int = 10
    app_store_url: Optional[str] = None


class PageFeatures:
    def __init__(self, url: str, title: str):
        self.url = url
        self.title = title
        self.navigation: list[str] = []
        self.forms: list[dict] = []
        self.ctas: list[str] = []
        self.media: dict = {"images": 0, "videos": 0}
        self.headings: list[dict] = []
        self.interactive_elements: list[str] = []
        self.meta: dict = {}
        self.sections: list[dict] = []
        self.footer_links: list[str] = []
        self.social_links: list[str] = []
        self.text_content: str = ""


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


async def fetch_page(client: httpx.AsyncClient, url: str) -> Optional[str]:
    try:
        response = await client.get(url, headers=HEADERS, follow_redirects=True, timeout=15.0)
        if response.status_code == 200 and "text/html" in response.headers.get("content-type", ""):
            return response.text
    except Exception:
        pass
    return None


def extract_features(html: str, url: str) -> PageFeatures:
    soup = BeautifulSoup(html, "lxml")
    title = ""
    title_tag = soup.find("title")
    if title_tag:
        title = title_tag.get_text(strip=True)
    features = PageFeatures(url=url, title=title)

    meta_desc = soup.find("meta", attrs={"name": "description"})
    if meta_desc:
        features.meta["description"] = meta_desc.get("content", "")
    meta_keywords = soup.find("meta", attrs={"name": "keywords"})
    if meta_keywords:
        features.meta["keywords"] = meta_keywords.get("content", "")
    og_title = soup.find("meta", attrs={"property": "og:title"})
    if og_title:
        features.meta["og_title"] = og_title.get("content", "")
    og_desc = soup.find("meta", attrs={"property": "og:description"})
    if og_desc:
        features.meta["og_description"] = og_desc.get("content", "")

    nav_elements = soup.find_all("nav")
    for nav in nav_elements:
        for link in nav.find_all("a"):
            text = link.get_text(strip=True)
            if text and len(text) < 100:
                features.navigation.append(text)

    for level in range(1, 7):
        for heading in soup.find_all(f"h{level}"):
            text = heading.get_text(strip=True)
            if text:
                features.headings.append({"level": level, "text": text[:200]})

    for form in soup.find_all("form"):
        form_data: dict = {"action": form.get("action", ""), "method": form.get("method", "GET"), "inputs": []}
        for inp in form.find_all(["input", "select", "textarea"]):
            input_info: dict = {
                "type": inp.get("type", inp.name),
                "name": inp.get("name", ""),
                "placeholder": inp.get("placeholder", ""),
            }
            form_data["inputs"].append(input_info)
        features.forms.append(form_data)

    for btn in soup.find_all(["button", "a"]):
        text = btn.get_text(strip=True)
        if text and len(text) < 80:
            classes = btn.get("class", [])
            class_str = " ".join(classes) if isinstance(classes, list) else str(classes)
            is_cta = any(
                kw in class_str.lower()
                for kw in ["btn", "button", "cta", "primary", "submit", "action"]
            ) or any(
                kw in text.lower()
                for kw in ["shop", "buy", "add to", "sign", "subscribe", "get started", "download", "apply", "checkout"]
            )
            if is_cta:
                features.ctas.append(text)

    features.media["images"] = len(soup.find_all("img"))
    features.media["videos"] = len(soup.find_all(["video", "iframe"]))

    for select in soup.find_all("select"):
        name = select.get("name", select.get("id", "dropdown"))
        features.interactive_elements.append(f"Dropdown: {name}")
    for _ in soup.find_all(attrs={"class": re.compile(r"carousel|slider|swiper", re.I)}):
        features.interactive_elements.append("Carousel/Slider component")
    for _ in soup.find_all(attrs={"data-toggle": "modal"}):
        features.interactive_elements.append("Modal dialog")
    for _ in soup.find_all(attrs={"role": "tablist"}):
        features.interactive_elements.append("Tabbed navigation")
    for _ in soup.find_all(attrs={"class": re.compile(r"accordion|collapse|expand", re.I)}):
        features.interactive_elements.append("Accordion/Collapsible section")
    features.interactive_elements = list(set(features.interactive_elements))

    for section in soup.find_all("section"):
        section_heading = section.find(["h1", "h2", "h3"])
        heading_text = section_heading.get_text(strip=True) if section_heading else ""
        section_text = section.get_text(strip=True)[:300]
        if heading_text or len(section_text) > 50:
            features.sections.append({"heading": heading_text, "summary": section_text[:200]})

    footer = soup.find("footer")
    if footer:
        for link in footer.find_all("a"):
            text = link.get_text(strip=True)
            href = link.get("href", "")
            if text and len(text) < 100:
                features.footer_links.append(f"{text} ({href})")

    social_patterns = ["facebook", "twitter", "instagram", "youtube", "pinterest", "linkedin", "tiktok", "x.com"]
    for link in soup.find_all("a", href=True):
        href = link.get("href", "").lower()
        for platform in social_patterns:
            if platform in href:
                features.social_links.append(href)
                break
    features.social_links = list(set(features.social_links))

    body = soup.find("body")
    if body:
        for tag in body.find_all(["script", "style", "noscript"]):
            tag.decompose()
        features.text_content = body.get_text(separator=" ", strip=True)[:2000]

    return features


def discover_internal_links(html: str, base_url: str, max_links: int = 50) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    parsed_base = urlparse(base_url)
    base_domain = parsed_base.netloc
    links: list[str] = []
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)
        if parsed.netloc == base_domain and parsed.scheme in ("http", "https"):
            clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            if clean_url not in links and clean_url != base_url:
                links.append(clean_url)
                if len(links) >= max_links:
                    break
    return links


def prioritize_links(links: list[str], base_url: str) -> list[str]:
    priority_keywords = [
        "about", "contact", "help", "support", "faq",
        "shop", "product", "category", "collection",
        "account", "signin", "login", "register",
        "cart", "bag", "checkout", "search", "sale", "deals",
        "store", "location", "privacy", "terms",
        "gift", "registry", "rewards", "loyalty",
    ]
    scored: list[tuple[str, int]] = []
    for link in links:
        path = urlparse(link).path.lower()
        score = 0
        for kw in priority_keywords:
            if kw in path:
                score += 10
        if path.count("/") <= 2:
            score += 5
        scored.append((link, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [link for link, _ in scored]


def features_to_markdown_section(features: PageFeatures, page_num: int) -> str:
    md = f"\n## {page_num}. {features.title or 'Untitled Page'}\n\n"
    md += f"**URL:** `{features.url}`\n\n"
    if features.meta.get("description"):
        md += f"**Description:** {features.meta['description']}\n\n"
    if features.navigation:
        md += "### Navigation Elements\n"
        unique_nav = list(dict.fromkeys(features.navigation))[:30]
        for item in unique_nav:
            md += f"- {item}\n"
        md += "\n"
    if features.headings:
        md += "### Page Sections (Headings)\n"
        for h in features.headings[:30]:
            prefix = "#" * h["level"]
            md += f"- {prefix} {h['text']}\n"
        md += "\n"
    if features.sections:
        md += "### Content Sections\n"
        for section in features.sections[:20]:
            if section["heading"]:
                md += f"- **{section['heading']}**: {section['summary'][:150]}...\n"
            else:
                md += f"- {section['summary'][:150]}...\n"
        md += "\n"
    if features.forms:
        md += "### Forms & Input Features\n"
        for i, form in enumerate(features.forms, 1):
            md += f"**Form {i}:**\n"
            md += f"- Action: `{form['action']}`\n"
            md += f"- Method: `{form['method']}`\n"
            for inp in form["inputs"]:
                label = inp["placeholder"] or inp["name"] or inp["type"]
                md += f"  - Input: {label} (type: {inp['type']})\n"
        md += "\n"
    if features.ctas:
        md += "### Call-to-Action Buttons\n"
        unique_ctas = list(dict.fromkeys(features.ctas))[:20]
        for cta in unique_ctas:
            md += f"- {cta}\n"
        md += "\n"
    if features.interactive_elements:
        md += "### Interactive UI Components\n"
        for elem in features.interactive_elements:
            md += f"- {elem}\n"
        md += "\n"
    md += "### Media Content\n"
    md += f"- Images: {features.media['images']}\n"
    md += f"- Videos/Embeds: {features.media['videos']}\n\n"
    if features.social_links:
        md += "### Social Media Links\n"
        for link in features.social_links:
            md += f"- {link}\n"
        md += "\n"
    if features.footer_links:
        md += "### Footer Links\n"
        unique_footer = list(dict.fromkeys(features.footer_links))[:30]
        for link in unique_footer:
            md += f"- {link}\n"
        md += "\n"
    return md


def generate_full_markdown(site_url: str, all_features: list[PageFeatures]) -> str:
    parsed = urlparse(site_url)
    domain = parsed.netloc or site_url
    md = f"# {domain} - Comprehensive Site Features Document\n\n"
    md += f"> **Purpose:** RAG context document capturing all features available on {domain}, organized by page. "
    md += "This document serves as domain knowledge for building a Retrieval-Augmented Generation (RAG) system.\n\n"
    md += f"> **Pages Crawled:** {len(all_features)}\n\n---\n\n"
    md += "## Table of Contents\n\n"
    for i, feat in enumerate(all_features, 1):
        title = feat.title or "Untitled Page"
        md += f"{i}. [{title}](#{i})\n"
    md += "\n---\n"
    for i, feat in enumerate(all_features, 1):
        md += features_to_markdown_section(feat, i)
        md += "---\n"

    all_nav: list[str] = []
    all_forms_count = 0
    all_ctas: list[str] = []
    all_interactive: list[str] = []
    total_images = 0
    total_videos = 0
    all_social: list[str] = []
    for feat in all_features:
        all_nav.extend(feat.navigation)
        all_forms_count += len(feat.forms)
        all_ctas.extend(feat.ctas)
        all_interactive.extend(feat.interactive_elements)
        total_images += feat.media["images"]
        total_videos += feat.media["videos"]
        all_social.extend(feat.social_links)

    md += "\n## Site-Wide Summary\n\n"
    md += "| Metric | Count |\n|---|---|\n"
    md += f"| Pages Crawled | {len(all_features)} |\n"
    md += f"| Unique Navigation Items | {len(set(all_nav))} |\n"
    md += f"| Total Forms | {all_forms_count} |\n"
    md += f"| Unique CTAs | {len(set(all_ctas))} |\n"
    md += f"| Interactive Components | {len(set(all_interactive))} |\n"
    md += f"| Total Images | {total_images} |\n"
    md += f"| Total Videos/Embeds | {total_videos} |\n"
    md += f"| Social Media Platforms | {len(set(all_social))} |\n\n"

    if set(all_ctas):
        md += "### All Call-to-Action Elements\n"
        for cta in sorted(set(all_ctas)):
            md += f"- {cta}\n"
        md += "\n"

    md += "\n---\n\n"
    md += "*Document generated by RAG Context Generator*\n"
    md += f"*Source: {site_url}*\n"
    md += "*Purpose: RAG context for domain application development*\n"
    return md


async def fetch_app_store_data(client: httpx.AsyncClient, app_store_url: str) -> Optional[str]:
    html = await fetch_page(client, app_store_url)
    if not html:
        return None
    soup = BeautifulSoup(html, "lxml")
    title_tag = soup.find("h1")
    title = title_tag.get_text(strip=True) if title_tag else "Unknown App"
    subtitle_tag = soup.find("h2")
    subtitle = subtitle_tag.get_text(strip=True) if subtitle_tag else ""
    description = ""
    for article in soup.find_all("article"):
        text = article.get_text(strip=True)
        if len(text) > 100:
            description = text
            break

    md = f"# {title} - iOS App Features Document\n\n"
    md += f"> **Subtitle:** {subtitle}\n\n"
    md += "> **Purpose:** RAG context document for this iOS mobile application.\n\n---\n\n"
    md += "## App Description\n\n"
    md += f"{description}\n\n"

    info_section = soup.find("h2", string=re.compile("Information", re.I))
    if info_section:
        md += "## App Information\n\n"
        parent = info_section.find_parent("section")
        if parent:
            for dt in parent.find_all("dt"):
                key = dt.get_text(strip=True)
                dd = dt.find_next("ul")
                val = dd.get_text(strip=True) if dd else ""
                md += f"- **{key}:** {val}\n"
        md += "\n"

    for h2 in soup.find_all("h2"):
        text = h2.get_text(strip=True)
        if "Data" in text and ("Track" in text or "Linked" in text):
            md += f"### {text}\n"
            parent_article = h2.find_parent("article")
            if parent_article:
                for li in parent_article.find_all("li"):
                    md += f"- {li.get_text(strip=True)}\n"
            md += "\n"

    md += "\n---\n\n*Document generated by RAG Context Generator*\n"
    md += f"*Source: {app_store_url}*\n"
    return md


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/api/crawl")
async def crawl_site(request: CrawlRequest):
    async def event_stream():
        all_features: list[PageFeatures] = []
        visited: set[str] = set()
        to_visit: list[str] = [request.url]

        async with httpx.AsyncClient() as client:
            page_count = 0
            while to_visit and page_count < request.max_pages:
                current_url = to_visit.pop(0)
                if current_url in visited:
                    continue
                visited.add(current_url)
                page_count += 1

                yield f"data: {json.dumps({'type': 'progress', 'page': page_count, 'total': request.max_pages, 'url': current_url, 'status': 'crawling'})}\n\n"

                html = await fetch_page(client, current_url)
                if not html:
                    yield f"data: {json.dumps({'type': 'progress', 'page': page_count, 'total': request.max_pages, 'url': current_url, 'status': 'failed'})}\n\n"
                    continue

                features = extract_features(html, current_url)
                all_features.append(features)
                yield f"data: {json.dumps({'type': 'progress', 'page': page_count, 'total': request.max_pages, 'url': current_url, 'status': 'done', 'title': features.title})}\n\n"

                if page_count < request.max_pages:
                    new_links = discover_internal_links(html, current_url)
                    prioritized = prioritize_links(new_links, request.url)
                    for link in prioritized:
                        if link not in visited and link not in to_visit:
                            to_visit.append(link)
                await asyncio.sleep(0.5)

            app_store_md = ""
            if request.app_store_url:
                yield f"data: {json.dumps({'type': 'progress', 'page': page_count, 'total': request.max_pages, 'url': request.app_store_url, 'status': 'crawling_app_store'})}\n\n"
                result = await fetch_app_store_data(client, request.app_store_url)
                if result:
                    app_store_md = result

            markdown = generate_full_markdown(request.url, all_features)
            if app_store_md:
                markdown += "\n\n---\n\n" + app_store_md

            yield f"data: {json.dumps({'type': 'complete', 'markdown': markdown, 'pages_crawled': len(all_features)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
