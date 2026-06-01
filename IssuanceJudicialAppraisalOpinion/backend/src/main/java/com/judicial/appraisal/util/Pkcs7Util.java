package com.judicial.appraisal.util;

import cn.hutool.crypto.SecureUtil;
import cn.hutool.crypto.digest.DigestUtil;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class Pkcs7Util {

    private static final String PKCS7_HEADER = "-----BEGIN PKCS7 SIGNATURE-----";
    private static final String PKCS7_FOOTER = "-----END PKCS7 SIGNATURE-----";

    public static String generateSignature(String data, String password) {
        String dataHash = DigestUtil.sha256Hex(data);
        String signedContent = dataHash + "|" + password + "|" + System.currentTimeMillis();
        String signatureHash = DigestUtil.sha256Hex(signedContent);
        String pkcs7Content = "PKCS7-SIM-V1\n" +
                "DataHash: " + dataHash + "\n" +
                "Algorithm: SHA256\n" +
                "Signature: " + signatureHash + "\n" +
                "Timestamp: " + System.currentTimeMillis();
        String encoded = Base64.getEncoder().encodeToString(pkcs7Content.getBytes(StandardCharsets.UTF_8));
        return PKCS7_HEADER + "\n" + encoded + "\n" + PKCS7_FOOTER;
    }

    public static boolean verifySignature(String data, String signature) {
        try {
            String content = signature
                    .replace(PKCS7_HEADER, "")
                    .replace(PKCS7_FOOTER, "")
                    .trim();
            byte[] decoded = Base64.getDecoder().decode(content);
            String pkcs7Content = new String(decoded, StandardCharsets.UTF_8);
            String dataHash = extractValue(pkcs7Content, "DataHash");
            String signatureHash = extractValue(pkcs7Content, "Signature");
            String expectedDataHash = DigestUtil.sha256Hex(data);
            return expectedDataHash.equals(dataHash) && signatureHash != null && !signatureHash.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    private static String extractValue(String content, String key) {
        String[] lines = content.split("\n");
        for (String line : lines) {
            if (line.startsWith(key + ":")) {
                return line.substring(key.length() + 1).trim();
            }
        }
        return null;
    }
}
