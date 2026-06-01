package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.entity.SysUser;
import com.maritime.pilotage.repository.SysUserRepository;
import com.maritime.pilotage.service.SysUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl implements SysUserService {

    private final SysUserRepository sysUserRepository;

    @Override
    public SysUser save(SysUser sysUser) {
        return sysUserRepository.save(sysUser);
    }

    @Override
    public Optional<SysUser> findById(Long id) {
        return sysUserRepository.findById(id);
    }

    @Override
    public List<SysUser> findAll() {
        return sysUserRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        sysUserRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return sysUserRepository.existsById(id);
    }

    @Override
    public long count() {
        return sysUserRepository.count();
    }
}
