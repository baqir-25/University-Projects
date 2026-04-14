//Baqir Zaidi 24L-0601
//Hasan Shaigan 24L-0621
//Ahmad Shah 24L-0918

#include <SFML/Graphics.hpp>//SFML used to give graphics
#include <SFML/Window.hpp>
#include <SFML/System.hpp>
#include <iostream>//Input Output Library
#include <cstdlib> //To allow for random spawn of aliens
#include <vector>//To figure out movement of aliens and bullets
#include <fstream>//To save highscore in files
using namespace std;
using namespace sf;

const int rows = 40;//Defining the space shooter board
const int columns = 40;

struct Alien {  //To define movement for aliens
    int row;
    int col;
    bool active;
};

struct Bullet {   //To define movement for bullets
    int row;
    int col;
    bool active;
};

void displayInstructions(RenderWindow& window, const Font& font) {  //SFML for displaying instructions
    Text instructions;
    instructions.setFont(font);
    instructions.setCharacterSize(20);
    instructions.setFillColor(Color::White);
    instructions.setPosition(50, 50);
    instructions.setString(
        "Space Shooter\n\n\n"
        "Instructions:\n"
        "- Use 'A' and 'D' keys to move the ship.\n"
        "- Press 'Space' to shoot bullets.\n"
        "- Shoot aliens to earn points.\n"
        "- Avoid aliens hitting you or reaching the bottom.\n"
        "- Progress through 5 levels to finish the game!\n\n"
        "Good Luck !!\n\n"
        "Press Enter to continue..."
    );

    while (window.isOpen()) {
        Event event;
        while (window.pollEvent(event)) {
            if (event.type == Event::Closed)
                window.close();

            if (event.type == Event::KeyPressed && event.key.code == Keyboard::Enter) {
                return; // Exit the instructions screen if Enter is pressed
            }
        }

        window.clear();
        window.draw(instructions);
        window.display();
    }
}

void initializeBoard(char arr[rows][columns]) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < columns; j++) {
            arr[i][j] = ' ';
        }
    }
}

void printBoard(RenderWindow& window, char arr[rows][columns], int lives, int highscore, int level, int score, const Font& font) {
    window.clear();

    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < columns; j++) {
            RectangleShape rectangle(Vector2f(30, 30));  //Defining the window of the main screen
            rectangle.setPosition(j * 20, i 
                * 20);
            if (arr[i][j] == '-') {
                rectangle.setFillColor(Color::White);
            }
            else if (arr[i][j] == '|') {
                rectangle.setFillColor(Color::White);
            }
            else if (arr[i][j] == 'I') {  //Assigning the ship 'I' a color
                rectangle.setFillColor(Color::Green);
            }
            else if (arr[i][j] == '*') {  //Assigning the bullet '*' a color
                rectangle.setFillColor(Color::Red);
            }
            else if (arr[i][j] == '0') {
                rectangle.setFillColor(Color::Blue);  //Assigning the aliens '0' a color
            }
            else {
                rectangle.setFillColor(Color::Black);
            }
            window.draw(rectangle);
        }
    }

    Text stats;  //To display the stats at the bottom of window
    stats.setFont(font);
    stats.setCharacterSize(20);
    stats.setFillColor(Color::White);

    stats.setString("Lives: " + to_string(lives));
    stats.setPosition(50, rows * 20 + 5);
    window.draw(stats);

    stats.setString("Highscore: " + to_string(highscore));
    stats.setPosition(200, rows * 20 + 5);
    window.draw(stats);

    stats.setString("Level: " + to_string(level));
    stats.setPosition(450, rows * 20 + 5);
    window.draw(stats);

    stats.setString("Score: " + to_string(score));
    stats.setPosition(600, rows * 20 + 5);
    window.draw(stats);

    window.display();
}

int loadHighscore(const string& filename) {
    ifstream infile(filename);
    int highscore = 0;
    if (infile.is_open()) {
        infile >> highscore;
        infile.close();
    }
    return highscore;
}

void saveHighscore(const string& filename, int highscore) {
    ofstream outfile(filename);
    if (outfile.is_open()) {
        outfile << highscore;
        outfile.close();
    }
}
void placeShip(char arr[rows][columns]) {  //Placing ship in the bottom row
    int startRow = rows - 2;
    int startCol = (columns - 1) / 2;

    if (startRow >= 0 && startRow < rows && startCol >= 0 && startCol + 1 <= columns) {
        arr[startRow][startCol] = 'I';
    }
}

void moveBullets(char arr[rows][columns], vector<Bullet>& bullets) {  //To manipulate bullets to move upwards
    for (auto& bullet : bullets) {
        if (bullet.active) {
            if (bullet.row - 1 >= 0) {
                arr[bullet.row][bullet.col] = ' ';
                bullet.row--;
                arr[bullet.row][bullet.col] = '*';
            }
            else {
                arr[bullet.row][bullet.col] = ' ';
                bullet.active = false;
            }
        }
    }
}

void moveShip(char arr[rows][columns], int& startRow, int& startCol, int lives, int highscore, int level, int score, const Font& font, Keyboard::Key key, RenderWindow& window, vector<Bullet>& bullets) {
    if (key == Keyboard::A && startCol > 0) {  //Pressing A moves ship to the left
        arr[startRow][startCol] = ' ';
        startCol--;
        arr[startRow][startCol] = 'I';
    }
    else if (key == Keyboard::D && startCol < columns - 1) {  //Pressing D moves ship to the right
        arr[startRow][startCol] = ' ';
        startCol++;
        arr[startRow][startCol] = 'I';
    }
    else if (key == Keyboard::Space) { //Pressing Space fires bullet
        Bullet newBullet = { startRow - 1, startCol, true }; // Create a new bullet
        bullets.push_back(newBullet); // Add the bullet to the vector
        arr[newBullet.row][newBullet.col] = '*'; // Place the bullet on the board
    }
}

void spawnAliens(char arr[rows][columns], int level, vector<Alien>& aliens, int lives) {
    for (auto& alien : aliens) {      // Clear any existing aliens from the board
        if (alien.active) {
            arr[alien.row][alien.col] = ' ';
        }
    }
    aliens.clear(); // Clear the vector of aliens

    if (lives > 0) {      // Only spawn new aliens if lives are greater than 0
        int numberOfAliens = 0;

        // Set the number of aliens based on the current level
        if (level == 1) {
            numberOfAliens = 3;
        }
        else if (level == 2) {
            numberOfAliens = 5;
        }
        else if (level == 3) {
            numberOfAliens = 7;
        }
        else if (level == 4) {
            numberOfAliens = 10;
        }
        else if (level == 5) {
            numberOfAliens = 15;
        }

        // Spawn the required number of aliens
        for (int i = 0; i < numberOfAliens; i++) {
            int col;
            do {
                col = rand() % columns; // Randomly select a column
            } while (arr[0][col] != ' '); // Ensure the column is empty

            arr[0][col] = '0'; // Place the alien on the board
            aliens.push_back({ 0, col, true }); // Add the alien to the vector
        }
    }
}

void moveAliens(char arr[rows][columns], vector<Alien>& aliens, float& alienTimer, float alienSpeed, float deltaTime) {
    alienTimer += deltaTime;
    if (alienTimer >= alienSpeed) {
        alienTimer = 0; // Reset the timer to start counting for the next move

        // Loop through each alien in the vector
        for (auto& alien : aliens) {
            if (alien.active) { // Process only if the alien is active
                if (alien.row + 1 < rows) { // Check if the alien can move downwards
                    arr[alien.row][alien.col] = ' ';
                    alien.row++; // Move the alien one row down
                    arr[alien.row][alien.col] = '0'; // Mark the alien's new position
                }
                else {
                    alien.active = false; // Deactivate the alien if it can't move further
                    arr[alien.row][alien.col] = ' ';
                }
            }
        }
    }
}



void checkCollisions( char arr[rows][columns], vector<Bullet>& bullets, vector<Alien>& aliens, int& score, int& level, int& lives, int startRow, int startCol) {
    for (auto& bullet : bullets) {
        if (bullet.active) {
            for (auto& alien : aliens) {
                if (alien.active && bullet.row == alien.row && bullet.col == alien.col) {  //If bullet hits aliens
                    alien.active = false; //Deactivate aliens
                    bullet.active = false;  //Deactivate bullet
                    score += 10; //Add 10 to the score
                    arr[bullet.row][bullet.col] = ' ';
                    break; // No need to check other aliens for this bullet
                }
            }
        }
    }

    // Remove inactive aliens from vector
    aliens.erase(remove_if(aliens.begin(), aliens.end(), [](Alien& alien) { return !alien.active; }), aliens.end());

    // Check for collisions with ship or aliens reaching the bottom
    for (auto& alien : aliens) {
        if (alien.active) {
            if (alien.row == startRow && alien.col == startCol) {  //If aliens reach the bottom
                lives--;
                if (lives < 0) {
                    lives = 0;
                }
                alien.active = false;
                arr[alien.row][alien.col] = ' ';
                if (lives > 0) {
                    spawnAliens(arr, level, aliens, lives); // Re-spawn aliens after life decrement
                }
            }
            else if (alien.row == rows - 1) {
                lives--;
                alien.active = false; //Deactivate alien once it reaches bottom
                arr[alien.row][alien.col] = ' ';
            }
        }
    }

    // Remove inactive bullets from vector
    bullets.erase(remove_if(bullets.begin(), bullets.end(), [](Bullet& bullet) { return !bullet.active; }), bullets.end());
}


void updateLevel(int& level, int score) {
    // Define score thresholds for each level
    const int levelThresholds[] = { 0, 30, 80, 150, 250, 400 };

    // Check if the score has reached the threshold for the next level
    if (level < sizeof(levelThresholds) / sizeof(levelThresholds[0]) && score >= levelThresholds[level]) {
        if (level < 5) { 
            level++; // Move to the next level
        } 
    }
}

void displayLevelScreen(RenderWindow& window, const Font& font, int level) {
    // Create a text object for the level display
    Text levelText;
    levelText.setFont(font);
    levelText.setCharacterSize(30);
    levelText.setFillColor(Color::Yellow);
    levelText.setString("Level " + to_string(level) + "\nGet Ready!");
    levelText.setPosition(100, 200);

    // Display the text on the window
    Clock clock;
    while (clock.getElapsedTime().asSeconds() < 2.0f) { // Show the screen for 2 seconds
        window.clear();
        window.draw(levelText);
        window.display();
    }
}

int main() {
    char board[rows][columns];
    int startRow = rows - 2;
    int startCol = (columns - 1) / 2;
    int lives = 3;
    int level = 1;
    int score = 0;
    const string highscoreFile = "highscore.txt";
    int highscore = loadHighscore(highscoreFile);

    Font font; //Load font wanted to be used
    if (!font.loadFromFile("Orbitron.ttf")) {
        cout << "Error loading font!" << endl;
        return -1;
    }

    RenderWindow window(VideoMode(columns * 20, rows * 20 + 50), "Space Shooter"); //Main window

    displayInstructions(window, font); 
    initializeBoard(board);
    placeShip(board);
    window.setFramerateLimit(60); //Set FPS to 60 for smooth gameplay
    vector<Alien> aliens;
    spawnAliens(board, level, aliens, lives);
    vector<Bullet> bullets;
    
    Clock clock;  //Clock used to avoid delays
    float alienTimer = 0.0f;
    float alienSpeed = 0.5f; // Alien speed (lower is faster)
    
        while (window.isOpen()) {
            float deltaTime = clock.restart().asSeconds();
            Event event;

            while (window.pollEvent(event)) {
                if (event.type == Event::Closed)
                    window.close();

                if (event.type == Event::KeyPressed) {
                    moveShip(board, startRow, startCol, lives, highscore, level, score, font, event.key.code, window, bullets);
                }
            }

            // Game logic
            moveAliens(board, aliens, alienTimer, alienSpeed, deltaTime);
            moveBullets(board, bullets);
            checkCollisions(board, bullets, aliens, score, level, lives, startRow, startCol);

            // Update the level based on score
            int previousLevel = level;
            updateLevel(level, score);

            // If level changes, spawn new aliens and adjust speed
            if (level > previousLevel && level <= 5 && lives > 0) {
                displayLevelScreen(window, font, level); // Display the level screen
                spawnAliens(board, level, aliens, lives);
                alienSpeed = max(0.1f, 0.5f - (level - 1) * 0.05f); // Adjust alien speed
            }

            if ((lives > 0 && level > 5) || (lives > 0 && aliens.empty())) { //Condition for winning
                
                if (score > highscore) {
                    highscore = score;
                    saveHighscore(highscoreFile, highscore);
                }

                Text winText; //Text to display when won
                winText.setFont(font);
                winText.setCharacterSize(30);
                winText.setFillColor(Color::Blue);
                winText.setString("You Win!!\n  Press Enter to Close");
                winText.setPosition(100, 200);

                while (window.isOpen()) {
                    window.clear();
                    window.draw(winText);
                    window.display();

                    Event event;
                    while (window.pollEvent(event)) {
                        if (event.type == Event::Closed) {
                            window.close();
                        }
                        if (event.type == Event::KeyPressed && event.key.code == Keyboard::Enter) {
                            window.close(); // Close the window and end the game
                        }
                    }
                }
            }


            if (lives <= 0) { //If player dies
                if (score > highscore) {
                    highscore = score;
                    saveHighscore(highscoreFile, highscore);
                }

                Text gameOverText; //Text to display when one dies
                gameOverText.setFont(font);
                gameOverText.setCharacterSize(20);
                gameOverText.setFillColor(Color::Red);
                gameOverText.setString("Game Over!!\nPress Enter to Restart\nPress ESC to Exit");
                gameOverText.setPosition(100, 200);

                window.clear();
                window.draw(gameOverText);
                window.display();

                bool restart = false;
                while (window.isOpen()) {
                    Event event;
                    while (window.pollEvent(event)) {
                        if (event.type == Event::Closed) {
                            window.close();
                        }
                        if (event.type == Event::KeyPressed) {
                            if (event.key.code == Keyboard::Enter) {
                                restart = true;
                                break; // Exit the event loop
                            }
                            if (event.key.code == Keyboard::Escape) {
                                window.close();
                            }
                        }
                    }
                    if (restart) {
                        // Reset game variables
                        lives = 3;
                        level = 1;
                        score = 0;

                        // Clear game objects
                        aliens.clear();
                        bullets.clear();

                        // Reinitialize board
                        initializeBoard(board);
                        placeShip(board);

                        // Spawn initial aliens
                        spawnAliens(board, level, aliens, lives);

                        alienSpeed = 0.5f; // Reset alien speed for level 1
                        break; // Exit the game-over loop and continue the main game loop
                    }
                }
            }

            // Render the board
            printBoard(window, board, lives, highscore, level, score, font);
        } 
    return 0;
}

