package Evolution;

import java.util.Random;

public class ParticipantRandomMover extends Participant {

	public ParticipantRandomMover(int nX, int nY, java.util.Random randomizer) {
		super(nX, nY);
		m_randomizer = randomizer;
	}

	@Override
	public void RandomizeGenome() {
		m_fXVelocity = (float)(m_randomizer.nextDouble() * (m_randomizer.nextBoolean()?-1:1));
		m_fYVelocity = (float)(m_randomizer.nextDouble() * (m_randomizer.nextBoolean()?-1:1));
	}

	@Override
	public void TakeTurn() {
		m_nX += m_fXVelocity;
		m_nY += m_fYVelocity;
	}

	private float m_fXVelocity;
	public float getXVelocity() {
		return m_fXVelocity;
	}

	private float m_fYVelocity;
	public float getYVelocity() {
		return m_fYVelocity;
	}

	private Random m_randomizer;
}
