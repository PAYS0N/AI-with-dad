import Evolution.TestLeft;
import Evolution.TestRunner;
import Evolution.World;

public class test {
    public static void main(String[] args) {
        System.out.println("Hello World");
        
        java.awt.Rectangle rectWorld = new java.awt.Rectangle(-5000, -5000, 10000, 10000);    // nOriginX, nOriginY, nWidth, nHeight
        World w = new World(rectWorld);
+++ Something not quite right here...
        TestRunner runner = new TestRunner(w, new TestLeft(100, 100));
        
        // w.addParticipant(p);

    }
}
