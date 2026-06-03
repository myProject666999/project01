package com.aics.quality.service;

import com.aics.quality.entity.CsScore;
import com.aics.quality.mapper.CsScoreMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class CsScoreService {

    @Autowired
    private CsScoreMapper csScoreMapper;

    private Random random = new Random();

    public List<CsScore> getRankingList(String month) {
        if (month == null || month.isEmpty()) {
            month = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return csScoreMapper.selectByMonthOrderByScore(month);
    }

    public CsScore getByCsIdAndMonth(Long csId, String month) {
        List<CsScore> list = csScoreMapper.selectByMonthOrderByScore(month);
        return list.stream()
                .filter(s -> s.getCsId().equals(csId))
                .findFirst()
                .orElse(null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void recalculateScores(String month) {
        if (month == null || month.isEmpty()) {
            month = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }

        List<CsScore> existingScores = csScoreMapper.selectByMonthOrderByScore(month);

        for (int i = 1; i <= 5; i++) {
            CsScore score = new CsScore();
            score.setCsId((long) i);
            score.setCsName("客服" + i);
            score.setStatisticsMonth(month);
            score.setTotalConversationCount(50 + random.nextInt(100));
            score.setQualityCount(40 + random.nextInt(60));
            score.setPassCount(35 + random.nextInt(50));
            score.setViolationCount(random.nextInt(10));
            score.setRuleScore(new java.math.BigDecimal(70 + random.nextInt(30)));
            score.setAiScore(new java.math.BigDecimal(70 + random.nextInt(30)));
            score.setTotalScore(new java.math.BigDecimal(70 + random.nextInt(30)));
            score.setAvgResponseTime(1000 + random.nextInt(5000));
            score.setAvgSatisfactionScore(new java.math.BigDecimal(70 + random.nextInt(30)));
            score.setRecalculateVersion(existingScores.isEmpty() ? 1 :
                    existingScores.get(0).getRecalculateVersion() + 1);
            score.setLastRecalculateTime(LocalDateTime.now());
            score.setCreateTime(LocalDateTime.now());
            score.setUpdateTime(LocalDateTime.now());

            long csId = (long) i;
            CsScore existing = existingScores.stream()
                    .filter(s -> s.getCsId().equals(csId))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                score.setId(existing.getId());
                csScoreMapper.updateById(score);
            } else {
                csScoreMapper.insert(score);
            }
        }

        List<CsScore> updatedScores = csScoreMapper.selectByMonthOrderByScore(month);
        List<CsScore> sortedScores = updatedScores.stream()
                .sorted(Comparator.comparing(CsScore::getTotalScore).reversed())
                .collect(Collectors.toList());

        for (int i = 0; i < sortedScores.size(); i++) {
            CsScore s = sortedScores.get(i);
            s.setRank(i + 1);
            csScoreMapper.updateById(s);
        }
    }
}
