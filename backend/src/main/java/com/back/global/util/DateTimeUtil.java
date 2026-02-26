package com.back.global.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {

    private static final String[] KOREAN_DAYS = {"월", "화", "수", "목", "금", "토", "일"};

    /**
     * DayOfWeek를 한국어로 변환
     * @param dayOfWeek DayOfWeek (MONDAY, TUESDAY, ...)
     * @return 한국어 요일 ("월", "화", "수", "목", "금", "토", "일")
     */
    public static String toKoreanDayOfWeek(DayOfWeek dayOfWeek) {
        return KOREAN_DAYS[dayOfWeek.getValue() - 1];
    }

    /**
     * LocalDate를 "M/d" 형식으로 포맷
     * @param date LocalDate
     * @return "2/25" 형식의 문자열
     */
    public static String formatToMd(LocalDate date) {
        return date.getMonthValue() + "/" + date.getDayOfMonth();
    }

    /**
     * LocalDateTime을 "M/d" 형식으로 포맷
     * @param dateTime LocalDateTime
     * @return "2/25" 형식의 문자열
     */
    public static String formatToMd(LocalDateTime dateTime) {
        return formatToMd(dateTime.toLocalDate());
    }

    /**
     * LocalDate를 ISO 8601 형식으로 포맷
     * @param date LocalDate
     * @return "2024-02-25" 형식의 문자열
     */
    public static String formatToIso(LocalDate date) {
        return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    /**
     * LocalDateTime을 ISO 8601 형식으로 포맷
     * @param dateTime LocalDateTime
     * @return ISO 8601 형식의 문자열
     */
    public static String formatToIso(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
