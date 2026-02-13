package com.foodsupplychain.oms.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI orderManagementOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Food Supply Chain - Order Management System API")
                        .description("REST API for managing orders, products, suppliers, customers, and inventory in a food supply chain")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Food Supply Chain OMS")
                                .email("support@foodsupplychain.com")));
    }
}
