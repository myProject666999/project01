package com.aics.quality.service;

import cn.hutool.core.util.IdUtil;
import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.entity.Appeal;
import com.aics.quality.entity.AppealFlow;
import com.aics.quality.entity.ViolationRecord;
import com.aics.quality.mapper.AppealFlowMapper;
import com.aics.quality.mapper.AppealMapper;
import com.aics.quality.mapper.ViolationRecordMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AppealService {

    @Autowired
    private AppealMapper appealMapper;

    @Autowired
    private AppealFlowMapper appealFlowMapper;

    @Autowired
    private ViolationRecordMapper violationRecordMapper;

    public PageResult<Appeal> list(PageQuery pageQuery, String keyword, Integer status) {
        LambdaQueryWrapper<Appeal> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Appeal::getAppellantName, keyword)
                    .or().like(Appeal::getAppealNo, keyword);
        }
        if (status != null) {
            wrapper.eq(Appeal::getStatus, status);
        }
        wrapper.orderByDesc(Appeal::getCreateTime);

        Page<Appeal> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        appealMapper.selectPage(page, wrapper);

        return PageResult.of(page.getTotal(), page.getRecords(), pageQuery.getPageNum(), pageQuery.getPageSize());
    }

    public Appeal getById(Long id) {
        return appealMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Appeal submit(Appeal appeal) {
        appeal.setAppealNo("APL" + IdUtil.getSnowflakeNextIdStr());
        appeal.setStatus(0);
        appeal.setSubmitTime(LocalDateTime.now());
        appeal.setCreateTime(LocalDateTime.now());
        appealMapper.insert(appeal);

        ViolationRecord violation = violationRecordMapper.selectById(appeal.getViolationId());
        if (violation != null) {
            violation.setStatus(3);
            violation.setIsAppealed(1);
            violationRecordMapper.updateById(violation);
        }

        AppealFlow flow = new AppealFlow();
        flow.setAppealId(appeal.getId());
        flow.setOperatorId(appeal.getAppellantId());
        flow.setOperatorName(appeal.getAppellantName());
        flow.setAction("SUBMIT");
        flow.setRemark("提交申诉");
        flow.setCreateTime(LocalDateTime.now());
        appealFlowMapper.insert(flow);

        return appeal;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean audit(Long id, Integer status, String auditOpinion, Long auditorId, String auditorName) {
        Appeal appeal = appealMapper.selectById(id);
        if (appeal == null) {
            return false;
        }
        appeal.setStatus(status);
        appeal.setAuditorId(auditorId);
        appeal.setAuditorName(auditorName);
        appeal.setAuditOpinion(auditOpinion);
        appeal.setAuditTime(LocalDateTime.now());
        appealMapper.updateById(appeal);

        ViolationRecord violation = violationRecordMapper.selectById(appeal.getViolationId());
        if (violation != null) {
            if (status == 1) {
                violation.setStatus(4);
            } else {
                violation.setStatus(2);
            }
            violationRecordMapper.updateById(violation);
        }

        AppealFlow flow = new AppealFlow();
        flow.setAppealId(appeal.getId());
        flow.setOperatorId(auditorId);
        flow.setOperatorName(auditorName);
        flow.setAction(status == 1 ? "AUDIT_PASS" : "AUDIT_REJECT");
        flow.setRemark(auditOpinion);
        flow.setCreateTime(LocalDateTime.now());
        appealFlowMapper.insert(flow);

        return true;
    }
}
