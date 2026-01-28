package com.restaurant.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * UserPrincipal
 * --------------
 * Spring Security compatible user object
 * Wraps application User details
 */
@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final String userId;
    private final String email;
    private final String password;
    private final List<SimpleGrantedAuthority> authorities;
    private final String role;

    // Authorities used by Spring Security for authorization
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    // Password used for authentication
    @Override
    public String getPassword() {
        return password;
    }

    // Username (email in our case)
    @Override
    public String getUsername() {
        return email;
    }

    // Account flags (kept simple)
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
