package com.foodsupplychain.oms.dto;

import com.foodsupplychain.oms.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateDTO {

    @NotNull(message = "Status is required")
    private OrderStatus status;

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
