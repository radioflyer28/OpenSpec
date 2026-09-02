## MODIFIED Requirements

### Requirement: Semantic obligations participate in aggregate assurance
While a required semantic obligation, stale plan, blocking finding, or unresolved human disposition remains, the aggregate OpenSpec Relay assurance result SHALL prevent successful archive unless an allowed audited override is recorded. New runs SHALL use `relay.assurance`; a required `gsd.assurance` result from a legacy run SHALL remain enforceable until its state is safely migrated or dispositioned.

#### Scenario: Required semantic obligation is unresolved
- **WHEN** archive is requested before required semantic or modeling assurance is completed or accepted at a lower level
- **THEN** the aggregate assurance gate blocks archive and reports remediation

#### Scenario: Human accepts lower assurance
- **WHEN** the developer records an allowed downgrade with its reason and achieved level
- **THEN** verification and archive report the disposition accurately
- **AND** do not report the missing evidence as completed

#### Scenario: Legacy gate remains unresolved after rename
- **WHEN** an active change has a blocking `gsd.assurance` result and OpenSpec Relay is installed
- **THEN** archive remains blocked until the legacy result is legitimately resolved, accepted, or overridden
- **AND** installing the renamed extension does not weaken the existing assurance obligation
