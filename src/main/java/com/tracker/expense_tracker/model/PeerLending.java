package com.tracker.expense_tracker.model;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "peer_lendings")
public class PeerLending {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String personName;
    private Double amount;
    private LocalDate dateLent;
    private LocalDate dateReturned;
    private String status = "PENDING";

    public PeerLending() {}

    public PeerLending(String personName, Double amount, LocalDate dateLent) {
        this.personName = personName;
        this.amount = amount;
        this.dateLent = dateLent;
        this.status = "PENDING";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPersonName() { return personName; }
    public void setPersonName(String personName) { this.personName = personName; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDate getDateLent() { return dateLent; }
    public void setDateLent(LocalDate dateLent) { this.dateLent = dateLent; }

    public LocalDate getDateReturned() { return dateReturned; }
    public void setDateReturned(LocalDate dateReturned) { this.dateReturned = dateReturned; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
