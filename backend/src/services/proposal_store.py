import uuid

from src.db.database import ProposalRow, get_session, init_db
from src.models.optimization_proposal import OptimizationProposal


class ProposalStore:
    def __init__(self) -> None:
        init_db()

    def save(self, proposal: OptimizationProposal) -> OptimizationProposal:
        with get_session() as session:
            row = session.get(ProposalRow, proposal.id)
            payload = proposal.model_dump_json()
            if row:
                row.data = payload
                row.user_id = proposal.user_id
            else:
                session.add(
                    ProposalRow(
                        id=proposal.id,
                        user_id=proposal.user_id,
                        data=payload,
                        created_at=proposal.created_at,
                    )
                )
            session.commit()
        return proposal

    def get_latest(self, user_id: str = "default") -> OptimizationProposal | None:
        with get_session() as session:
            row = (
                session.query(ProposalRow)
                .filter(ProposalRow.user_id == user_id)
                .order_by(ProposalRow.created_at.desc())
                .first()
            )
            if not row:
                return None
            return OptimizationProposal.model_validate_json(row.data)

    def get(self, proposal_id: str) -> OptimizationProposal | None:
        with get_session() as session:
            row = session.get(ProposalRow, proposal_id)
            return OptimizationProposal.model_validate_json(row.data) if row else None

    def new_id(self) -> str:
        return str(uuid.uuid4())


proposal_store = ProposalStore()
