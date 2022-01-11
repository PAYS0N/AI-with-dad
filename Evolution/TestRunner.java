package Evolution;

public class TestRunner {

	public TestRunner( World w, Test t ) {
		m_world = w;
		m_test = t;
	}

	private World m_world;
	public World getWorld() {
		return m_world;
	}

	private Test m_test;
	public Test getTest() {
		return m_test;
	}
}
