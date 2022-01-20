package Evolution;

public class TestLeft extends Test {
	public TestLeft( int nParticipants, int nLifespans, int nCyclesPerLifespan ) {
		m_nParticipants = nParticipants;
		m_nLifespans = nLifespans;
		m_nCyclesPerLifespan = nCyclesPerLifespan;
	}

	@Override
	public boolean ShouldSurvive( Participant p, World w ) {
		return p.getX() < w.getOrigin().getX() + w.getSize().getWidth()/2;
	}

	private int m_nParticipants;
	@Override
	public int getNumberOfParticipants() {
		return m_nParticipants;
	}

	private int m_nLifespans;
	@Override
	public int getLifespans() {
		return m_nLifespans;
	}

	private int m_nCyclesPerLifespan;
	@Override
	public int getCyclesPerLifespan() {
		return m_nCyclesPerLifespan;
	}
}
