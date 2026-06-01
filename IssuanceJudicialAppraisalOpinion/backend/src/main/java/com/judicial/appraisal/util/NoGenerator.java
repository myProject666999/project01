package com.judicial.appraisal.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

public class NoGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private static final AtomicInteger entrustmentSequence = new AtomicInteger(1);
    private static final AtomicInteger evidenceSequence = new AtomicInteger(1);
    private static final AtomicInteger chainSequence = new AtomicInteger(1);
    private static final AtomicInteger opinionSequence = new AtomicInteger(1);
    private static final AtomicInteger attachmentSequence = new AtomicInteger(1);
    private static final AtomicInteger taskSequence = new AtomicInteger(1);
    private static final AtomicInteger recordSequence = new AtomicInteger(1);

    private static volatile String lastEntrustmentDate = "";
    private static volatile String lastEvidenceDate = "";
    private static volatile String lastChainDate = "";
    private static volatile String lastOpinionDate = "";
    private static volatile String lastAttachmentDate = "";
    private static volatile String lastTaskDate = "";
    private static volatile String lastRecordDate = "";

    public static synchronized String generateEntrustmentNo() {
        String currentDate = LocalDate.now().format(DATE_FORMATTER);
        if (!currentDate.equals(lastEntrustmentDate)) {
            entrustmentSequence.set(1);
            lastEntrustmentDate = currentDate;
        }
        int seq = entrustmentSequence.getAndIncrement();
        return String.format("WT%s%06d", currentDate, seq);
    }

    public static synchronized String generateEvidenceNo() {
        String currentDate = LocalDate.now().format(DATE_FORMATTER);
        if (!currentDate.equals(lastEvidenceDate)) {
            evidenceSequence.set(1);
            lastEvidenceDate = currentDate;
        }
        int seq = evidenceSequence.getAndIncrement();
        return String.format("JC%s%06d", currentDate, seq);
    }

    public static synchronized String generateChainNo() {
        String currentDate = LocalDate.now().format(DATE_FORMATTER);
        if (!currentDate.equals(lastChainDate)) {
            chainSequence.set(1);
            lastChainDate = currentDate;
        }
        int seq = chainSequence.getAndIncrement();
        return String.format("GL%s%06d", currentDate, seq);
    }

    public static synchronized String generateOpinionNo() {
        String currentDate = LocalDate.now().format(DATE_FORMATTER);
        if (!currentDate.equals(lastOpinionDate)) {
            opinionSequence.set(1);
            lastOpinionDate = currentDate;
        }
        int seq = opinionSequence.getAndIncrement();
        return String.format("JD%s%06d", currentDate, seq);
    }

    public static synchronized String generateAttachmentNo() {
        String currentDate = LocalDate.now().format(DATE_FORMATTER);
        if (!currentDate.equals(lastAttachmentDate)) {
            attachmentSequence.set(1);
            lastAttachmentDate = currentDate;
        }
        int seq = attachmentSequence.getAndIncrement();
        return String.format("FJ%s%06d", currentDate, seq);
    }

    public static synchronized String generateTaskNo() {
        String currentDate = LocalDate.now().format(DATE_FORMATTER);
        if (!currentDate.equals(lastTaskDate)) {
            taskSequence.set(1);
            lastTaskDate = currentDate;
        }
        int seq = taskSequence.getAndIncrement();
        return String.format("RW%s%06d", currentDate, seq);
    }

    public static synchronized String generateRecordNo() {
        String currentDate = LocalDate.now().format(DATE_FORMATTER);
        if (!currentDate.equals(lastRecordDate)) {
            recordSequence.set(1);
            lastRecordDate = currentDate;
        }
        int seq = recordSequence.getAndIncrement();
        return String.format("JY%s%06d", currentDate, seq);
    }
}
