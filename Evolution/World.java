package Evolution;

public class World {
	public World( java.awt.Rectangle rectWorldExtents ) {
		m_rectExtents = rectWorldExtents;
	}

	private java.awt.Rectangle m_rectExtents;
	public java.awt.Point getOrigin() {
		return m_rectExtents.getLocation();
	}
	public java.awt.Dimension getSize() {
		return m_rectExtents.getSize();
	}
	
	private int m_nCyclesRun = 0;
	public int getCyclesRun() {
		return m_nCyclesRun;
	}

	private java.util.ArrayList<Participant> m_alp = new java.util.ArrayList<Participant>();
	protected Participant addParticipant( Participant p ) {
		m_alp.add(p);
		return p;
	}
	protected java.util.ArrayList<Participant> getParticipants() {
		return m_alp;
	}

}