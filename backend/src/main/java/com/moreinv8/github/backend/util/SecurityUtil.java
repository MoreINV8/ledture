package com.moreinv8.github.backend.util;

import com.moreinv8.github.backend.exception.BusinessException;
import com.moreinv8.github.backend.model.User;
import com.moreinv8.github.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Utility methods related to the security context.
 *
 * <p>This class currently supports two ways of obtaining the authenticated user ID:
 * <ul>
 *   <li>If Spring Security is fully wired – the {@link Authentication#getPrincipal()} returns a {@link User}
 *       instance (or a custom {@code UserDetails} that can be cast to {@link User}).</li>
 *   <li>If you are still on the placeholder implementation where the principal is the user's email
 *       string, the helper will look the user up via {@link UserRepository}.</li>
 * </ul>
 * If neither case matches, a {@link BusinessException} with the message {@code UNAUTHORIZED}
 * is thrown.
 */
public final class SecurityUtil {

    private SecurityUtil() {}

    /**
     * Retrieves the UUID of the currently authenticated user.
     *
     * @param userRepository repository used for the email‑fallback lookup.
     * @return the authenticated user's UUID.
     * @throws BusinessException if no authentication information is available.
     */
    public static UUID getAuthenticatedUserId(UserRepository userRepository) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new BusinessException("UNAUTHORIZED");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        if (principal instanceof String email) {
            // fallback for the simple placeholder implementation
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException("UNAUTHORIZED"));
            return user.getId();
        }
        throw new BusinessException("UNAUTHORIZED");
    }
}
