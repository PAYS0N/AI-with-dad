package Evolution;

public class TestLeft extends Test {
	public TestLeft( int nParticipants, int nLifespans ) {
		m_nParticipants = nParticipants;
		m_nLifespans = nLifespans;
	}

	public boolean ShouldSurvive( Participant p, World w ) {
		return p.getX() < w.getOrigin().getX() + w.getSize().getWidth()/2;
	}

	private int m_nParticipants;
	public int getNumberOfParticipants() {
		return m_nParticipants;
	}

	private int m_nLifespans;
	public int getLifespans() {
		return m_nLifespans;
	}
}
