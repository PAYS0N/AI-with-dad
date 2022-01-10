import java.util.ArrayList;

public class World {
	public World( int nWidth, int nHeight ) {
		m_nWidth = nWidth;
		m_nHeight = nHeight;
	}

	private int m_nCyclesRun = 0;

	private int m_nWidth;
	public int getWidth() { 
		return m_nWidth; 
	}

	private int m_nHeight;
	public int getHeight() { 
		return m_nHeight; 
	}

	private ArrayList<Participant> m_alp = new ArrayList<Participant>();
	protected Participant addParticipant( Participant p ) {
		m_alp.add(p);
		return p;
	}

	// perhaps width and height, a list of participants in the world, the number of actions in a cycle and a cycle counter
}