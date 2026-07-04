package com.hackathon.document.service;

import com.hackathon.common.dto.DocumentDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface DocumentService {
    DocumentDto uploadDocument(Long claimId, MultipartFile file, String category) throws IOException;
    List<DocumentDto> listDocuments(Long claimId);
    Resource downloadDocument(String documentId);
    void deleteDocument(String documentId);
}
