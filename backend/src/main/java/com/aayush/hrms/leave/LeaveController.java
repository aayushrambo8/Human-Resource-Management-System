package com.aayush.hrms.leave;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('leave:write')")
    public LeaveSummary submit(@Valid @RequestBody LeaveSubmission submission, Principal principal) {
        return leaveService.submit(principal.getName(), submission);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('leave:read') or hasAuthority('leave:write')")
    public List<LeaveSummary> list(Authentication authentication) {
        boolean canReadAll = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("leave:read"));
        return leaveService.list(authentication.getName(), canReadAll);
    }

    @PatchMapping("/{id}/decision")
    @PreAuthorize("hasAuthority('leave:review')")
    public LeaveSummary review(
            @PathVariable UUID id, @Valid @RequestBody LeaveDecision decision, Principal principal) {
        return leaveService.review(id, principal.getName(), decision.status());
    }
}
