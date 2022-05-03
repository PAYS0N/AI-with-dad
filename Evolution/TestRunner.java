package Evolution;

import java.util.Random;

public class TestRunner {

	/***
	 * 
	 * @param w The world to test in.
	 * @param t The test to use.
	 */
	public TestRunner( World w, Test t ) {
		m_world = w;
		m_test = t;
		m_nSeed = m_randomizer.nextLong();
		m_randomizer.setSeed(m_nSeed);
	}

	/***
	 * 
	 * @param w The world to test in.
	 * @param t The test to use.
	 * @param nSeed A seed for the random number generator.  Use getSeed() to get the seed from a given test run and save it to duplicate the run later.
	 */
	public TestRunner( World w, Test t, long nSeed ) {
		m_world = w;
		m_test = t;
		m_nSeed = nSeed;
		m_randomizer.setSeed(m_nSeed);
	}

	public void Run() {
		// Set up the test
		for( int iParticipant = 0; iParticipant < m_test.getNumberOfParticipants(); ++iParticipant ) {
			Participant p = new ParticipantRandomMover( 
				(int)(m_world.getOrigin().getX() + (m_randomizer.nextDouble() * m_world.getSize().getWidth()))
				, (int)(m_world.getOrigin().getY() + (m_randomizer.nextDouble() * m_world.getSize().getHeight()))
				, m_randomizer
			);
		}

		// Run the lifecycles
		for( int iLifespan = 0; iLifespan < m_test.getLifespans(); ++iLifespan ) {

			for( int iCycle = 0; iCycle < m_test.getCyclesPerLifespan(); ++iCycle ) {
				// Take a daily action
				for (Participant p : m_world.getParticipants()) {
					p.TakeTurn();
				}
			}

			// Cull and reproduce
			for (Participant p : m_world.getParticipants()) {
				java.util.ArrayList<Participant> alpSurvivors = new java.util.ArrayList<Participant>();
				if( m_test.ShouldSurvive(p, m_world) ) {

				}
				else {

				}
			}
		}


	}

	private World m_world;
	public World getWorld() {
		return m_world;
	}

	private Test m_test;
	public Test getTest() {
		return m_test;
	}

	private Random m_randomizer = new java.util.Random();

	private long m_nSeed;
	public long getSeed() {
		return m_nSeed;
	}
}
