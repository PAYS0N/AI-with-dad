import Evolution.TestLeft;
import Evolution.TestRunner;
import Evolution.World;

public class test {
    public static void main(String[] args) {
        
        java.awt.Rectangle rectWorld = new java.awt.Rectangle(-5000, -5000, 10000, 10000);    // nOriginX, nOriginY, nWidth, nHeight
        World w = new World(rectWorld);

        TestRunner runner = new TestRunner(w, new TestLeft(100, 100, 10));
        System.out.println("Starting test run...");
        runner.Run();
        System.out.println("...done.");
    }
}
