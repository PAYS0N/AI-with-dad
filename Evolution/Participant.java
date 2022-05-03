package Evolution;

public abstract class Participant {

	public Participant( int nX, int nY ) {
		m_nX = nX;
		m_nY = nY;
		RandomizeGenome();
	}

	public abstract void RandomizeGenome();

	/**
	 * Take the turn the Participant takes, e.g. moving in a direction, looking for resources, or fighting.
	 */
	public abstract void TakeTurn();

	protected int m_nX;
	public int getX() {
		return m_nX;
	}

	protected int m_nY;
	public int getY() {
		return m_nY;
	}
}
