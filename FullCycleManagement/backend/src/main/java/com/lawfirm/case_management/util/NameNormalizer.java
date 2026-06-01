package com.lawfirm.case_management.util;

import net.sourceforge.pinyin4j.PinyinHelper;
import net.sourceforge.pinyin4j.format.HanyuPinyinCaseType;
import net.sourceforge.pinyin4j.format.HanyuPinyinOutputFormat;
import net.sourceforge.pinyin4j.format.HanyuPinyinToneType;
import net.sourceforge.pinyin4j.format.HanyuPinyinVCharType;
import net.sourceforge.pinyin4j.format.exception.BadHanyuPinyinOutputFormatCombination;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class NameNormalizer {

    private static final HanyuPinyinOutputFormat pinyinFormat = new HanyuPinyinOutputFormat();

    private static final Map<Character, Character> SIMPLIFIED_MAP = new HashMap<>();

    static {
        pinyinFormat.setCaseType(HanyuPinyinCaseType.LOWERCASE);
        pinyinFormat.setToneType(HanyuPinyinToneType.WITHOUT_TONE);
        pinyinFormat.setVCharType(HanyuPinyinVCharType.WITH_V);

        SIMPLIFIED_MAP.put('張', '张');
        SIMPLIFIED_MAP.put('李', '李');
        SIMPLIFIED_MAP.put('王', '王');
        SIMPLIFIED_MAP.put('趙', '赵');
        SIMPLIFIED_MAP.put('劉', '刘');
        SIMPLIFIED_MAP.put('陳', '陈');
        SIMPLIFIED_MAP.put('楊', '杨');
        SIMPLIFIED_MAP.put('黃', '黄');
        SIMPLIFIED_MAP.put('周', '周');
        SIMPLIFIED_MAP.put('吳', '吴');
        SIMPLIFIED_MAP.put('徐', '徐');
        SIMPLIFIED_MAP.put('孫', '孙');
        SIMPLIFIED_MAP.put('胡', '胡');
        SIMPLIFIED_MAP.put('朱', '朱');
        SIMPLIFIED_MAP.put('高', '高');
        SIMPLIFIED_MAP.put('林', '林');
        SIMPLIFIED_MAP.put('何', '何');
        SIMPLIFIED_MAP.put('郭', '郭');
        SIMPLIFIED_MAP.put('馬', '马');
        SIMPLIFIED_MAP.put('羅', '罗');
        SIMPLIFIED_MAP.put('樑', '梁');
        SIMPLIFIED_MAP.put('宋', '宋');
        SIMPLIFIED_MAP.put('鄭', '郑');
        SIMPLIFIED_MAP.put('謝', '谢');
        SIMPLIFIED_MAP.put('韓', '韩');
        SIMPLIFIED_MAP.put('唐', '唐');
        SIMPLIFIED_MAP.put('馮', '冯');
        SIMPLIFIED_MAP.put('於', '于');
        SIMPLIFIED_MAP.put('董', '董');
        SIMPLIFIED_MAP.put('蕭', '萧');
        SIMPLIFIED_MAP.put('程', '程');
        SIMPLIFIED_MAP.put('曹', '曹');
        SIMPLIFIED_MAP.put('袁', '袁');
        SIMPLIFIED_MAP.put('鄧', '邓');
        SIMPLIFIED_MAP.put('許', '许');
        SIMPLIFIED_MAP.put('傅', '傅');
        SIMPLIFIED_MAP.put('沈', '沈');
        SIMPLIFIED_MAP.put('曾', '曾');
        SIMPLIFIED_MAP.put('彭', '彭');
        SIMPLIFIED_MAP.put('呂', '吕');
        SIMPLIFIED_MAP.put('蘇', '苏');
        SIMPLIFIED_MAP.put('盧', '卢');
        SIMPLIFIED_MAP.put('蔣', '蒋');
        SIMPLIFIED_MAP.put('蔡', '蔡');
        SIMPLIFIED_MAP.put('賈', '贾');
        SIMPLIFIED_MAP.put('丁', '丁');
        SIMPLIFIED_MAP.put('魏', '魏');
        SIMPLIFIED_MAP.put('薛', '薛');
        SIMPLIFIED_MAP.put('葉', '叶');
        SIMPLIFIED_MAP.put('閻', '阎');
        SIMPLIFIED_MAP.put('餘', '余');
        SIMPLIFIED_MAP.put('潘', '潘');
        SIMPLIFIED_MAP.put('杜', '杜');
        SIMPLIFIED_MAP.put('戴', '戴');
        SIMPLIFIED_MAP.put('夏', '夏');
        SIMPLIFIED_MAP.put('鍾', '钟');
        SIMPLIFIED_MAP.put('汪', '汪');
        SIMPLIFIED_MAP.put('田', '田');
        SIMPLIFIED_MAP.put('任', '任');
        SIMPLIFIED_MAP.put('薑', '姜');
        SIMPLIFIED_MAP.put('範', '范');
        SIMPLIFIED_MAP.put('方', '方');
        SIMPLIFIED_MAP.put('石', '石');
        SIMPLIFIED_MAP.put('姚', '姚');
        SIMPLIFIED_MAP.put('譚', '谭');
        SIMPLIFIED_MAP.put('廖', '廖');
        SIMPLIFIED_MAP.put('鄒', '邹');
        SIMPLIFIED_MAP.put('熊', '熊');
        SIMPLIFIED_MAP.put('金', '金');
        SIMPLIFIED_MAP.put('陸', '陆');
        SIMPLIFIED_MAP.put('郝', '郝');
        SIMPLIFIED_MAP.put('孔', '孔');
        SIMPLIFIED_MAP.put('白', '白');
        SIMPLIFIED_MAP.put('崔', '崔');
        SIMPLIFIED_MAP.put('康', '康');
        SIMPLIFIED_MAP.put('毛', '毛');
        SIMPLIFIED_MAP.put('邱', '邱');
        SIMPLIFIED_MAP.put('秦', '秦');
        SIMPLIFIED_MAP.put('江', '江');
        SIMPLIFIED_MAP.put('史', '史');
        SIMPLIFIED_MAP.put('顧', '顾');
        SIMPLIFIED_MAP.put('侯', '侯');
        SIMPLIFIED_MAP.put('邵', '邵');
        SIMPLIFIED_MAP.put('孟', '孟');
        SIMPLIFIED_MAP.put('龍', '龙');
        SIMPLIFIED_MAP.put('萬', '万');
        SIMPLIFIED_MAP.put('段', '段');
        SIMPLIFIED_MAP.put('雷', '雷');
        SIMPLIFIED_MAP.put('錢', '钱');
        SIMPLIFIED_MAP.put('湯', '汤');
        SIMPLIFIED_MAP.put('尹', '尹');
        SIMPLIFIED_MAP.put('黎', '黎');
        SIMPLIFIED_MAP.put('易', '易');
        SIMPLIFIED_MAP.put('常', '常');
        SIMPLIFIED_MAP.put('武', '武');
        SIMPLIFIED_MAP.put('喬', '乔');
        SIMPLIFIED_MAP.put('賀', '贺');
        SIMPLIFIED_MAP.put('賴', '赖');
        SIMPLIFIED_MAP.put('龔', '龚');
        SIMPLIFIED_MAP.put('文', '文');
    }

    public String normalize(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "";
        }

        String normalized = name.trim();

        normalized = normalized.replaceAll("\\s+", "");

        normalized = toSimplified(normalized);

        normalized = toPinyin(normalized);

        normalized = normalized.toLowerCase();

        return normalized;
    }

    private String toSimplified(String name) {
        StringBuilder sb = new StringBuilder();
        for (char c : name.toCharArray()) {
            Character simplified = SIMPLIFIED_MAP.get(c);
            sb.append(simplified != null ? simplified : c);
        }
        return sb.toString();
    }

    private String toPinyin(String name) {
        StringBuilder sb = new StringBuilder();
        for (char c : name.toCharArray()) {
            if (Character.toString(c).matches("[\\u4E00-\\u9FA5]+")) {
                try {
                    String[] pinyinArray = PinyinHelper.toHanyuPinyinStringArray(c, pinyinFormat);
                    if (pinyinArray != null && pinyinArray.length > 0) {
                        sb.append(pinyinArray[0]);
                    } else {
                        sb.append(c);
                    }
                } catch (BadHanyuPinyinOutputFormatCombination e) {
                    sb.append(c);
                }
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    public boolean isSimilar(String name1, String name2) {
        if (name1 == null || name2 == null) {
            return false;
        }

        String norm1 = normalize(name1);
        String norm2 = normalize(name2);

        if (norm1.equals(norm2)) {
            return true;
        }

        if (norm1.contains(norm2) || norm2.contains(norm1)) {
            return true;
        }

        return calculateSimilarity(norm1, norm2) > 0.8;
    }

    private double calculateSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) {
            return 0.0;
        }

        String longer = s1;
        String shorter = s2;
        if (s1.length() < s2.length()) {
            longer = s2;
            shorter = s1;
        }

        int longerLength = longer.length();
        if (longerLength == 0) {
            return 1.0;
        }

        int[][] dp = new int[shorter.length() + 1][longer.length() + 1];

        for (int i = 0; i <= shorter.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= longer.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= shorter.length(); i++) {
            for (int j = 1; j <= longer.length(); j++) {
                int cost = (shorter.charAt(i - 1) == longer.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
            }
        }

        return (longerLength - dp[shorter.length()][longer.length()]) / (double) longerLength;
    }
}
