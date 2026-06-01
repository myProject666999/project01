package com.aics.quality.service;

import cn.hutool.core.util.IdUtil;
import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.entity.ScriptLibrary;
import com.aics.quality.mapper.ScriptLibraryMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ScriptLibraryService {

    @Autowired
    private ScriptLibraryMapper scriptLibraryMapper;

    public PageResult<ScriptLibrary> list(PageQuery pageQuery, String keyword, Long categoryId, Integer status) {
        LambdaQueryWrapper<ScriptLibrary> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(ScriptLibrary::getTitle, keyword)
                    .or().like(ScriptLibrary::getContent, keyword)
                    .or().like(ScriptLibrary::getKeywords, keyword);
        }
        if (categoryId != null) {
            wrapper.eq(ScriptLibrary::getCategoryId, categoryId);
        }
        if (status != null) {
            wrapper.eq(ScriptLibrary::getStatus, status);
        }
        wrapper.orderByDesc(ScriptLibrary::getUseCount);
        wrapper.orderByDesc(ScriptLibrary::getLikeCount);
        wrapper.orderByDesc(ScriptLibrary::getCreateTime);

        Page<ScriptLibrary> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        scriptLibraryMapper.selectPage(page, wrapper);

        return PageResult.of(page.getTotal(), page.getRecords(), pageQuery.getPageNum(), pageQuery.getPageSize());
    }

    public ScriptLibrary getById(Long id) {
        return scriptLibraryMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public ScriptLibrary save(ScriptLibrary script) {
        script.setScriptCode("SCR" + IdUtil.getSnowflakeNextIdStr());
        script.setUseCount(0);
        script.setLikeCount(0);
        script.setStatus(1);
        script.setCreateTime(LocalDateTime.now());
        scriptLibraryMapper.insert(script);
        return script;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean update(ScriptLibrary script) {
        script.setUpdateTime(LocalDateTime.now());
        return scriptLibraryMapper.updateById(script) > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        return scriptLibraryMapper.deleteById(id) > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public void incrementUseCount(Long id) {
        ScriptLibrary script = scriptLibraryMapper.selectById(id);
        if (script != null) {
            script.setUseCount(script.getUseCount() + 1);
            scriptLibraryMapper.updateById(script);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void incrementLikeCount(Long id) {
        ScriptLibrary script = scriptLibraryMapper.selectById(id);
        if (script != null) {
            script.setLikeCount(script.getLikeCount() + 1);
            scriptLibraryMapper.updateById(script);
        }
    }
}
