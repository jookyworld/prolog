package com.back.global.converter;

import com.back.domain.community.sharedRoutine.dto.RoutineSnapshotWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RoutineSnapshotConverter implements AttributeConverter<RoutineSnapshotWrapper, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(RoutineSnapshotWrapper attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert RoutineSnapshotWrapper to JSON", e);
        }
    }

    @Override
    public RoutineSnapshotWrapper convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(dbData, RoutineSnapshotWrapper.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert JSON to RoutineSnapshotWrapper", e);
        }
    }
}
