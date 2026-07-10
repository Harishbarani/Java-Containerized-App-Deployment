package com.tracker.expense_tracker.controller;

import com.tracker.expense_tracker.model.PeerLending;
import com.tracker.expense_tracker.model.Transaction;
import com.tracker.expense_tracker.service.TrackerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TrackerController {

    @Autowired
    private TrackerService trackerService;

    @PostMapping("/transactions")
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        return ResponseEntity.ok(trackerService.saveTransaction(transaction));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(trackerService.getAllTransactions());
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<String> deleteTransaction(@PathVariable Long id) {
        trackerService.deleteTransaction(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    @PostMapping("/lending")
    public ResponseEntity<PeerLending> createLending(@RequestBody PeerLending lending) {
        return ResponseEntity.ok(trackerService.saveLending(lending));
    }

    @GetMapping("/lending")
    public ResponseEntity<List<PeerLending>> getAllLendings() {
        return ResponseEntity.ok(trackerService.getAllLendings());
    }

    @PutMapping("/lending/{id}/tally")
    public ResponseEntity<PeerLending> tallyLending(@PathVariable Long id) {
        return ResponseEntity.ok(trackerService.tallyLending(id));
    }
}