package com.timesheet.api.service;

import com.timesheet.api.dto.ClientRequest;
import com.timesheet.api.dto.ClientResponse;
import com.timesheet.api.entity.Client;
import com.timesheet.api.repository.ClientRepository;
import com.timesheet.api.repository.WorkEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final WorkEntryRepository workEntryRepository;
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public List<ClientResponse> getAllClients(String userEmail) {
        return clientRepository.findByUserEmailOrderByNameAsc(userEmail)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Optional<ClientResponse> getClientById(Long id, String userEmail) {
        return clientRepository.findByIdAndUserEmail(id, userEmail)
                .map(this::toResponse);
    }

    @Transactional
    public ClientResponse createClient(ClientRequest request, String userEmail) {
        Client client = Client.builder()
                .name(request.getName())
                .description(request.getDescription())
                .userEmail(userEmail)
                .build();
        
        Client saved = clientRepository.save(client);
        return toResponse(saved);
    }

    @Transactional
    public Optional<ClientResponse> updateClient(Long id, ClientRequest request, String userEmail) {
        return clientRepository.findByIdAndUserEmail(id, userEmail)
                .map(client -> {
                    client.setName(request.getName());
                    client.setDescription(request.getDescription());
                    return toResponse(clientRepository.save(client));
                });
    }

    @Transactional
    public boolean deleteClient(Long id, String userEmail) {
        Optional<Client> client = clientRepository.findByIdAndUserEmail(id, userEmail);
        if (client.isPresent()) {
            workEntryRepository.deleteByClientId(id);
            clientRepository.delete(client.get());
            return true;
        }
        return false;
    }

    @Transactional
    public void deleteAllClients(String userEmail) {
        List<Client> clients = clientRepository.findByUserEmailOrderByNameAsc(userEmail);
        for (Client client : clients) {
            workEntryRepository.deleteByClientId(client.getId());
        }
        clientRepository.deleteByUserEmail(userEmail);
    }

    public boolean existsById(Long id, String userEmail) {
        return clientRepository.existsByIdAndUserEmail(id, userEmail);
    }

    private ClientResponse toResponse(Client client) {
        return ClientResponse.builder()
                .id(client.getId())
                .name(client.getName())
                .description(client.getDescription())
                .created_at(client.getCreatedAt().format(ISO_FORMATTER))
                .updated_at(client.getUpdatedAt().format(ISO_FORMATTER))
                .build();
    }
}
