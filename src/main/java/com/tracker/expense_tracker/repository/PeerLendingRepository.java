package com.tracker.expense_tracker.repository;
import com.tracker.expense_tracker.model.PeerLending;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PeerLendingRepository extends JpaRepository<PeerLending, Long> {
    List<PeerLending> findByStatus(String status);
}
