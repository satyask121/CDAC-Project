package com.restaurant.security;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.entity.User;
import com.restaurant.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * CustomUserDetailsServiceImpl
 * ----------------------------
 * Used by Spring Security during LOGIN
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Called automatically by AuthenticationManager
     */
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

    	 System.out.println(" LOGIN EMAIL = " + email);
        log.info("Loading user by email : {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email : " + email));

        return new UserPrincipal(
                String.valueOf(user.getId()),
                user.getEmail(),
                user.getPasswordHash(),
                List.of(new org.springframework.security.core.authority
                        .SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                user.getRole().name()
        );
    }
}
