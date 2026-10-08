package com.aayush.hrms.leave;

import com.aayush.hrms.auth.UserAccount;
import com.aayush.hrms.auth.UserAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final UserAccountRepository accountRepository;

    public LeaveService(LeaveRequestRepository leaveRepository, UserAccountRepository accountRepository) {
        this.leaveRepository = leaveRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public LeaveSummary submit(String email, LeaveSubmission submission) {
        if (submission.endDate().isBefore(submission.startDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date must be on or after start date");
        }
        UserAccount account = findAccount(email);
        if (account.getEmployee() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Account is not linked to an employee");
        }
        LeaveRequest request = leaveRepository.save(new LeaveRequest(
                account.getEmployee(),
                submission.startDate(),
                submission.endDate(),
                submission.reason().trim()));
        return LeaveSummary.from(request);
    }

    @Transactional
    public List<LeaveSummary> list(String email, boolean canReadAll) {
        UserAccount account = findAccount(email);
        List<LeaveRequest> requests = canReadAll
                ? leaveRepository.findAllByOrderByCreatedAtDesc()
                : account.getEmployee() == null
                        ? List.of()
                        : leaveRepository.findAllByEmployeeIdOrderByCreatedAtDesc(account.getEmployee().getId());
        return requests.stream().map(LeaveSummary::from).toList();
    }

    @Transactional
    public LeaveSummary review(UUID id, String email, LeaveStatus status) {
        if (status == LeaveStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A leave request cannot be reset to pending");
        }
        LeaveRequest request = leaveRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found"));
        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Leave request has already been reviewed");
        }
        request.review(status, findAccount(email));
        return LeaveSummary.from(request);
    }

    private UserAccount findAccount(String email) {
        return accountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
