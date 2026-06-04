package com.tcm.pulse.service;

import com.tcm.pulse.common.PageResult;
import com.tcm.pulse.entity.Herb;
import com.tcm.pulse.entity.HerbAlias;
import com.tcm.pulse.exception.BusinessException;
import com.tcm.pulse.repository.HerbAliasRepository;
import com.tcm.pulse.repository.HerbRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HerbService {

    private final HerbRepository herbRepository;
    private final HerbAliasRepository herbAliasRepository;

    public PageResult<Herb> findPage(int pageNum, int pageSize, String keyword) {
        Pageable pageable = PageRequest.of(pageNum - 1, pageSize, Sort.by("name"));
        Page<Herb> page = herbRepository.findByKeyword(keyword, pageable);
        return new PageResult<>(page.getContent(), page.getTotalElements(), pageNum, pageSize);
    }

    public List<Herb> findAll() {
        return herbRepository.findAll(Sort.by("name"));
    }

    public Herb findById(Long id) {
        return herbRepository.findById(id)
                .orElseThrow(() -> new BusinessException("药材不存在"));
    }

    public Herb findByNameOrAlias(String name) {
        return herbRepository.findByNameOrAlias(name)
                .orElseThrow(() -> new BusinessException("药材不存在: " + name));
    }

    public List<HerbAlias> getAliases(Long herbId) {
        return herbAliasRepository.findByHerbId(herbId);
    }

    @Transactional
    public Herb addAlias(Long herbId, String aliasName) {
        Herb herb = findById(herbId);
        if (herbAliasRepository.findByHerbIdAndAliasName(herbId, aliasName).isPresent()) {
            throw new BusinessException("别名已存在");
        }
        HerbAlias alias = new HerbAlias();
        alias.setHerbId(herbId);
        alias.setAliasName(aliasName);
        herbAliasRepository.save(alias);
        return herb;
    }

    @Transactional
    public void removeAlias(Long aliasId) {
        if (!herbAliasRepository.existsById(aliasId)) {
            throw new BusinessException("别名不存在");
        }
        herbAliasRepository.deleteById(aliasId);
    }

    public Optional<Herb> findByName(String name) {
        return herbRepository.findByName(name);
    }

    public Optional<Herb> findByAliasName(String aliasName) {
        return herbRepository.findByAliasName(aliasName);
    }
}
