package Evolution;

public abstract class Test {
	public abstract boolean ShouldSurvive( Participant p, World w );
	public abstract int getNumberOfParticipants();
	public abstract int getLifespans();
	public abstract int getCyclesPerLifespan();
}
