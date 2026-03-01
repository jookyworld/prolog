package com.back.global.converter;

import com.back.domain.community.sharedRoutine.dto.SessionSnapshotWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class SessionSnapshotConverter implements AttributeConverter<SessionSnapshotWrapper, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(SessionSnapshotWrapper attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert SessionSnapshotWrapper to JSON", e);
        }
    }

    @Override
    public SessionSnapshotWrapper convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(dbData, SessionSnapshotWrapper.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert JSON to SessionSnapshotWrapper", e);
        }
    }
}
