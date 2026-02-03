package com.timesheet.api.controller;

import com.timesheet.api.dto.ClientRequest;
import com.timesheet.api.dto.ClientResponse;
import com.timesheet.api.dto.ErrorResponse;
import com.timesheet.api.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<Map<String, List<ClientResponse>>> getAllClients(Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        List<ClientResponse> clients = clientService.getAllClients(userEmail);
        
        Map<String, List<ClientResponse>> response = new HashMap<>();
        response.put("clients", clients);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClientById(@PathVariable Long id, Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        Optional<ClientResponse> clientOpt = clientService.getClientById(id, userEmail);
        if (clientOpt.isPresent()) {
            Map<String, ClientResponse> response = new HashMap<>();
            response.put("client", clientOpt.get());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Client not found"));
    }

    @PostMapping
    public ResponseEntity<?> createClient(@Valid @RequestBody ClientRequest request, Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        ClientResponse client = clientService.createClient(request, userEmail);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Client created successfully");
        response.put("client", client);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody ClientRequest request,
            Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        Optional<ClientResponse> clientOpt = clientService.updateClient(id, request, userEmail);
        if (clientOpt.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Client updated successfully");
            response.put("client", clientOpt.get());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Client not found"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id, Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        
        if (clientService.deleteClient(id, userEmail)) {
            return ResponseEntity.ok(Map.of("message", "Client deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Client not found"));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllClients(Authentication authentication) {
        String userEmail = (String) authentication.getPrincipal();
        clientService.deleteAllClients(userEmail);
        return ResponseEntity.ok(Map.of("message", "All clients deleted successfully"));
    }
}
