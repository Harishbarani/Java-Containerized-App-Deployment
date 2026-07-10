package com.tracker.expense_tracker.service;
import com.tracker.expense_tracker.model.PeerLending;
import com.tracker.expense_tracker.model.Transaction;
import com.tracker.expense_tracker.model.TransactionType;
import com.tracker.expense_tracker.repository.PeerLendingRepository;
import com.tracker.expense_tracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class TrackerService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PeerLendingRepository peerLendingRepository;

    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    public PeerLending saveLending(PeerLending lending) {
        lending.setStatus("PENDING");
        return peerLendingRepository.save(lending);
    }

    public List<PeerLending> getAllLendings() {
        return peerLendingRepository.findAll();
    }

    public PeerLending tallyLending(Long id) {
        PeerLending lending = peerLendingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lending record not found"));
        lending.setStatus("TALLYED");
        lending.setDateReturned(LocalDate.now());
        return peerLendingRepository.save(lending);
    }
}
