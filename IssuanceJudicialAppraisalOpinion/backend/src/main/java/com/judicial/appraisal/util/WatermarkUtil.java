package com.judicial.appraisal.util;

import cn.hutool.crypto.digest.DigestUtil;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class WatermarkUtil {

    public static byte[] addWatermark(byte[] imageBytes, String timestamp, String location) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
        if (image == null) {
            throw new IOException("Invalid image data");
        }

        int width = image.getWidth();
        int height = image.getHeight();

        BufferedImage watermarked = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = watermarked.createGraphics();
        g2d.drawImage(image, 0, 0, null);

        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2d.setFont(new Font("SansSerif", Font.PLAIN, Math.max(12, width / 40)));
        g2d.setColor(new Color(255, 255, 255, 180));

        String watermarkText = "时间: " + timestamp + "\n地点: " + location;
        String[] lines = watermarkText.split("\n");

        FontMetrics fm = g2d.getFontMetrics();
        int lineHeight = fm.getHeight();
        int margin = 20;

        int y = height - margin - (lines.length - 1) * lineHeight;
        for (String line : lines) {
            int x = width - margin - fm.stringWidth(line);
            g2d.drawString(line, x, y);
            y += lineHeight;
        }

        g2d.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(watermarked, "jpg", baos);
        return baos.toByteArray();
    }

    public static String generateFileHash(byte[] fileBytes) {
        return DigestUtil.sha256Hex(fileBytes);
    }
}
