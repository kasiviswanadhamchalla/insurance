package com.hackathon.document.controller;

import com.hackathon.common.annotation.RequiresRole;
import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.DocumentDto;
import com.hackathon.document.service.DocumentService;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.Document;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
public class DocumentController {

    private final DocumentService documentService;
    private final GridFsTemplate gridFsTemplate;

    public DocumentController(DocumentService documentService, GridFsTemplate gridFsTemplate) {
        this.documentService = documentService;
        this.gridFsTemplate = gridFsTemplate;
    }

    @PostMapping("/claims/{id}/documents")
    @RequiresRole({"ROLE_USER", "ROLE_PROCESSOR"})
    public ResponseEntity<ApiResponse<DocumentDto>> uploadDocument(
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "receipt") String category) throws IOException {
        DocumentDto dto = documentService.uploadDocument(id, file, category);
        return ResponseEntity.ok(ApiResponse.success(dto, "Document uploaded successfully"));
    }

    @GetMapping("/claims/{id}/documents")
    @RequiresRole({"ROLE_USER", "ROLE_PROCESSOR", "ROLE_MANAGER"})
    public ResponseEntity<ApiResponse<List<DocumentDto>>> listDocuments(@PathVariable("id") Long id) {
        List<DocumentDto> dtos = documentService.listDocuments(id);
        return ResponseEntity.ok(ApiResponse.success(dtos, "Documents list retrieved successfully"));
    }

    @GetMapping("/documents/{documentId}/download")
    @RequiresRole({"ROLE_USER", "ROLE_PROCESSOR", "ROLE_MANAGER"})
    public ResponseEntity<Resource> downloadDocument(@PathVariable("documentId") String documentId) {
        GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(documentId)));
        String fileName = file != null ? file.getFilename() : "document";
        String contentType = (file != null && file.getMetadata() != null) ? 
                (String) file.getMetadata().get("contentType") : "application/octet-stream";

        Resource resource = documentService.downloadDocument(documentId);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @DeleteMapping("/documents/{documentId}")
    @RequiresRole("ROLE_USER")
    public ResponseEntity<ApiResponse<String>> deleteDocument(@PathVariable("documentId") String documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", "Document deleted successfully"));
    }
}
