package cn.arorms.prp.finance.controllers;

import cn.arorms.framework.security.UserPrincipal;
import cn.arorms.prp.finance.services.StatisticsService;
import cn.arorms.prp.finance.vos.AccountBalanceVo;
import cn.arorms.prp.finance.vos.SummaryVo;
import cn.arorms.prp.finance.vos.TrendPointVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    private final StatisticsService statisticsService;

    @Autowired
    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryVo> summary(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(statisticsService.summary(user.getId(), from, to));
    }

    @GetMapping("/trend")
    public ResponseEntity<List<TrendPointVo>> trend(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "day") String unit) {
        return ResponseEntity.ok(statisticsService.trend(user.getId(), from, to, unit));
    }

    @GetMapping("/account-balances")
    public ResponseEntity<List<AccountBalanceVo>> accountBalances(
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(statisticsService.accountBalances(user.getId()));
    }
}
