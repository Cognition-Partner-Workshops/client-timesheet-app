package com.timesheet.api.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.opencsv.CSVWriter;
import com.timesheet.api.dto.ReportResponse;
import com.timesheet.api.entity.Client;
import com.timesheet.api.entity.WorkEntry;
import com.timesheet.api.repository.ClientRepository;
import com.timesheet.api.repository.WorkEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ClientRepository clientRepository;
    private final WorkEntryRepository workEntryRepository;
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    public Optional<ReportResponse> getClientReport(Long clientId, String userEmail) {
        Optional<Client> clientOpt = clientRepository.findByIdAndUserEmail(clientId, userEmail);
        
        if (clientOpt.isEmpty()) {
            return Optional.empty();
        }

        Client client = clientOpt.get();
        List<WorkEntry> workEntries = workEntryRepository.findByClientIdAndUserEmailOrderByDateDesc(clientId, userEmail);

        BigDecimal totalHours = workEntries.stream()
                .map(WorkEntry::getHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ReportResponse.WorkEntryInfo> entryInfos = workEntries.stream()
                .map(entry -> ReportResponse.WorkEntryInfo.builder()
                        .id(entry.getId())
                        .hours(entry.getHours())
                        .description(entry.getDescription())
                        .date(entry.getDate().format(DATE_FORMATTER))
                        .created_at(entry.getCreatedAt().format(ISO_FORMATTER))
                        .updated_at(entry.getUpdatedAt().format(ISO_FORMATTER))
                        .build())
                .collect(Collectors.toList());

        return Optional.of(ReportResponse.builder()
                .client(ReportResponse.ClientInfo.builder()
                        .id(client.getId())
                        .name(client.getName())
                        .build())
                .workEntries(entryInfos)
                .totalHours(totalHours)
                .entryCount(workEntries.size())
                .build());
    }

    public Optional<byte[]> exportCsv(Long clientId, String userEmail) {
        Optional<Client> clientOpt = clientRepository.findByIdAndUserEmail(clientId, userEmail);
        
        if (clientOpt.isEmpty()) {
            return Optional.empty();
        }

        Client client = clientOpt.get();
        List<WorkEntry> workEntries = workEntryRepository.findByClientIdAndUserEmailOrderByDateDesc(clientId, userEmail);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {

            writer.writeNext(new String[]{"Client: " + client.getName()});
            writer.writeNext(new String[]{});
            writer.writeNext(new String[]{"Date", "Hours", "Description"});

            BigDecimal totalHours = BigDecimal.ZERO;
            for (WorkEntry entry : workEntries) {
                writer.writeNext(new String[]{
                        entry.getDate().format(DATE_FORMATTER),
                        entry.getHours().toString(),
                        entry.getDescription() != null ? entry.getDescription() : ""
                });
                totalHours = totalHours.add(entry.getHours());
            }

            writer.writeNext(new String[]{});
            writer.writeNext(new String[]{"Total Hours", totalHours.toString()});
            writer.writeNext(new String[]{"Total Entries", String.valueOf(workEntries.size())});

            writer.flush();
            return Optional.of(baos.toByteArray());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<byte[]> exportPdf(Long clientId, String userEmail) {
        Optional<Client> clientOpt = clientRepository.findByIdAndUserEmail(clientId, userEmail);
        
        if (clientOpt.isEmpty()) {
            return Optional.empty();
        }

        Client client = clientOpt.get();
        List<WorkEntry> workEntries = workEntryRepository.findByClientIdAndUserEmailOrderByDateDesc(clientId, userEmail);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter pdfWriter = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(pdfWriter);
            Document document = new Document(pdfDoc);

            Paragraph title = new Paragraph("Time Report: " + client.getName())
                    .setFontSize(18)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(title);

            Table table = new Table(UnitValue.createPercentArray(new float[]{25, 15, 60}))
                    .setWidth(UnitValue.createPercentValue(100));

            table.addHeaderCell(new Cell().add(new Paragraph("Date").setFontSize(12)));
            table.addHeaderCell(new Cell().add(new Paragraph("Hours").setFontSize(12)));
            table.addHeaderCell(new Cell().add(new Paragraph("Description").setFontSize(12)));

            BigDecimal totalHours = BigDecimal.ZERO;
            for (WorkEntry entry : workEntries) {
                table.addCell(new Cell().add(new Paragraph(entry.getDate().format(DATE_FORMATTER))));
                table.addCell(new Cell().add(new Paragraph(entry.getHours().toString())));
                table.addCell(new Cell().add(new Paragraph(entry.getDescription() != null ? entry.getDescription() : "")));
                totalHours = totalHours.add(entry.getHours());
            }

            document.add(table);

            Paragraph summary = new Paragraph()
                    .add("Total Hours: " + totalHours.toString() + "\n")
                    .add("Total Entries: " + workEntries.size())
                    .setMarginTop(20)
                    .setFontSize(12);
            document.add(summary);

            document.close();
            return Optional.of(baos.toByteArray());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
