package com.hackathon.document.service;

import com.hackathon.common.dto.DocumentDto;
import com.hackathon.common.exception.ResourceNotFoundException;
import com.mongodb.BasicDBObject;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.Document;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final GridFsTemplate gridFsTemplate;
    private final GridFsOperations gridFsOperations;

    public DocumentServiceImpl(GridFsTemplate gridFsTemplate, GridFsOperations gridFsOperations) {
        this.gridFsTemplate = gridFsTemplate;
        this.gridFsOperations = gridFsOperations;
    }

    @Override
    public DocumentDto uploadDocument(Long claimId, MultipartFile file, String category) throws IOException {
        Document metadata = new Document();
        metadata.put("claimId", claimId);
        metadata.put("category", category);
        metadata.put("contentType", file.getContentType());

        Object fileId = gridFsTemplate.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType(),
                metadata
        );

        return DocumentDto.builder()
                .id(fileId.toString())
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .claimId(claimId)
                .category(category)
                .build();
    }

    @Override
    public List<DocumentDto> listDocuments(Long claimId) {
        Query query = new Query(Criteria.where("metadata.claimId").is(claimId));
        List<GridFSFile> files = new ArrayList<>();
        gridFsTemplate.find(query).into(files);

        List<DocumentDto> dtos = new ArrayList<>();
        for (GridFSFile file : files) {
            Document metadata = file.getMetadata();
            dtos.add(DocumentDto.builder()
                    .id(file.getId().toString())
                    .fileName(file.getFilename())
                    .contentType(metadata != null ? (String) metadata.get("contentType") : null)
                    .uploadDate(file.getUploadDate().toInstant())
                    .claimId(claimId)
                    .category(metadata != null ? (String) metadata.get("category") : null)
                    .build());
        }
        return dtos;
    }

    @Override
    public Resource downloadDocument(String documentId) {
        GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(documentId)));
        if (file == null) {
            throw new ResourceNotFoundException("Document not found with ID: " + documentId);
        }

        try {
            return new InputStreamResource(gridFsOperations.getResource(file).getInputStream());
        } catch (IOException e) {
            throw new RuntimeException("Failed to download document: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteDocument(String documentId) {
        GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(documentId)));
        if (file == null) {
            throw new ResourceNotFoundException("Document not found with ID: " + documentId);
        }
        gridFsTemplate.delete(new Query(Criteria.where("_id").is(documentId)));
    }
}
