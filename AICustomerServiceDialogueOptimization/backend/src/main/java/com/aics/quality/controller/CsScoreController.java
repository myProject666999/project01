package com.aics.quality.controller;

import com.aics.quality.common.Result;
import com.aics.quality.entity.CsScore;
import com.aics.quality.service.CsScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/score")
public class CsScoreController {

    @Autowired
    private CsScoreService csScoreService;

    @GetMapping("/ranking")
    public Result<List<CsScore>> getRankingList(@RequestParam(required = false) String month) {
        return Result.success(csScoreService.getRankingList(month));
    }

    @GetMapping("/{csId}")
    public Result<CsScore> getByCsIdAndMonth(
            @PathVariable Long csId,
            @RequestParam(required = false) String month) {
        return Result.success(csScoreService.getByCsIdAndMonth(csId, month));
    }

    @PostMapping("/recalculate")
    public Result<Void> recalculateScores(@RequestParam(required = false) String month) {
        csScoreService.recalculateScores(month);
        return Result.success();
    }
}
