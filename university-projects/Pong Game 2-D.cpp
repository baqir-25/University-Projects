#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <cctype>
using namespace std;
using namespace sf;

// Constants
const int WINDOW_WIDTH = 800;
const int WINDOW_HEIGHT = 600;
const float PADDLE_WIDTH = 10;
const float PADDLE_HEIGHT = 100;
const float BALL_RADIUS = 10;
const int WIN_SCORE = 10;

// Ball class
class Ball {
public:
    CircleShape shape;
    Vector2f velocity;

    Ball(float radius = BALL_RADIUS) {
        shape.setRadius(radius);
        shape.setFillColor(Color::White);
        shape.setOrigin(radius, radius);
        reset(true);  // Default direction towards the left when first starting
    }

    void reset(bool towardsLeft) {
        shape.setPosition(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);

        // Randomize the ball's direction within a reasonable range (30° to 60°)
        float speedFactor = 12.0f;  // Adjust ball speed to fit your game
        float angle = static_cast<float>(rand() % 30 + 30); // Random angle between 30° and 60°

        // Convert the angle to radians
        float radian = angle * 3.14159f / 180.0f;

        // Set the velocity based on the randomized angle, but avoid going too steep
        velocity.x = (towardsLeft ? -1 : 1) * speedFactor * cos(radian);
        velocity.y = speedFactor * sin(radian);

        // To make sure we don't get a straight horizontal or vertical movement,
        // prevent the velocity from being too close to 0 in the x or y direction
        if (abs(velocity.x) < 2.0f) {
            velocity.x = (velocity.x < 0 ? -1 : 1) * 2.0f;
        }
        if (abs(velocity.y) < 2.0f) {
            velocity.y = (velocity.y < 0 ? -1 : 1) * 2.0f;
        }
    }

    void update() {
        shape.move(velocity);

        // Ball collision with top and bottom walls (bounce vertically)
        if (shape.getPosition().y - BALL_RADIUS < 0 || shape.getPosition().y + BALL_RADIUS > WINDOW_HEIGHT) {
            velocity.y = -velocity.y;  // Reverse vertical direction
        }
    }

    FloatRect getBounds() {
        return shape.getGlobalBounds();
    }

    void setDirectionTowardsPlayer(bool towardsLeft) {
        reset(towardsLeft);  // Reset the ball to go towards the player who lost
    }
};


// Paddle class
class Paddle {
public:
    RectangleShape shape;
    float speed;
    bool isAI;

    Paddle(float x, float y, bool ai = false) : isAI(ai) {
        shape.setSize({ PADDLE_WIDTH, PADDLE_HEIGHT });
        shape.setFillColor(Color::Black);
        shape.setOrigin(PADDLE_WIDTH / 2, PADDLE_HEIGHT / 2);
        shape.setPosition(x, y);
        speed = 9.0f;
    }

    void moveUp() {
        if (shape.getPosition().y - PADDLE_HEIGHT / 2 > 0)
            shape.move(0, -speed);
    }

    void moveDown() {
        if (shape.getPosition().y + PADDLE_HEIGHT / 2 < WINDOW_HEIGHT)
            shape.move(0, speed);
    }

    void aiMove(float ballY) {
        // Make AI less perfect, with a slight delay
        float paddleY = shape.getPosition().y;
        float speedFactor = 0.5f; // AI speed factor to make it beatable

        if (paddleY + PADDLE_HEIGHT / 2 < ballY) {
            if (paddleY + PADDLE_HEIGHT / 2 + speed * speedFactor < ballY)
                shape.move(0, speed * speedFactor);
        }
        else if (paddleY - PADDLE_HEIGHT / 2 > ballY) {
            if (paddleY - PADDLE_HEIGHT / 2 - speed * speedFactor > ballY)
                shape.move(0, -speed * speedFactor);
        }
    }

    FloatRect getBounds() {
        return shape.getGlobalBounds();
    }
};

class Game {
private:
    RenderWindow window;
    Font font;
    Text scoreText;
    Paddle left, right;
    Ball ball;
    int scoreLeft = 0, scoreRight = 0;
    int mode;
    string player1, player2;
    SoundBuffer hitBuffer, gameOverBuffer;
    Sound hitSound, gameOverSound;

public:
    Game() : window(VideoMode(WINDOW_WIDTH, WINDOW_HEIGHT), "Pong Game"), left(50, WINDOW_HEIGHT / 2), right(WINDOW_WIDTH - 50, WINDOW_HEIGHT / 2)
    {
        window.setFramerateLimit(60);

        // Load font
        if (!font.loadFromFile("PressStart2P-Regular.ttf")) {
            cerr << "Font missing\n";
            exit(1);
        }

        // Load sounds
        if (!hitBuffer.loadFromFile("hit.wav") || !gameOverBuffer.loadFromFile("gameover.wav")) {
            cerr << "Missing sound files\n";
            exit(1);
        }

        hitSound.setBuffer(hitBuffer);
        gameOverSound.setBuffer(gameOverBuffer);

        // Initialize score text
        scoreText.setFont(font);
        scoreText.setCharacterSize(30);
        scoreText.setFillColor(Color::Black);
    }

    void saveScore(const string& name, int score) {
        ofstream out("scores.txt", ios::app);
        if (out.is_open()) {
            out << name << " " << score << endl;
            out.close();
        }
    }

    string getPlayerName(const string& prompt) {
        RenderWindow inputWin(VideoMode(400, 150), "Enter Player Name");
        string input = "";

        Text promptText(prompt, font, 18);
        promptText.setFillColor(Color::White);
        promptText.setPosition(20, 20);

        Text inputText("", font, 24);
        inputText.setFillColor(Color::White);
        inputText.setPosition(20, 60);

        while (inputWin.isOpen()) {
            Event event;
            while (inputWin.pollEvent(event)) {
                if (event.type == Event::Closed)
                    inputWin.close();
                else if (event.type == Event::TextEntered) {
                    if (event.text.unicode == '\b' && !input.empty()) input.pop_back();
                    else if (event.text.unicode == '\r') inputWin.close();
                    else if (isprint(event.text.unicode)) input += static_cast<char>(event.text.unicode);
                }
            }

            inputText.setString(input);
            inputWin.clear(Color(30, 30, 30));
            inputWin.draw(promptText);
            inputWin.draw(inputText);
            inputWin.display();
        }

        return input;
    }

    void dottedLine() {
        // Draw a dotted line in the middle of the field
        float lineHeight = 15;  // Height of each small rectangle
        float spacing = 20;     // Space between each rectangle
        float yStart = 0;  // Start at the top of the window

        // Adjust yStart so the dotted line extends from top to bottom, below score
        yStart = scoreText.getLocalBounds().height + 10;

        for (int i = 0; i < 30; ++i) {  // Increase the number of dots
            RectangleShape dot(Vector2f(2, lineHeight));  // Small rectangle
            dot.setFillColor(Color::Black);
            dot.setPosition(WINDOW_WIDTH / 2 - 1, yStart + i * (lineHeight + spacing)); // Centering horizontally
            window.draw(dot);
        }
    }

    int chooseMode() {
        RenderWindow modeWin(VideoMode(600, 350), "Choose Game Mode");

        Text title("Select Game Mode", font, 22);
        title.setFillColor(Color::White);
        title.setPosition(200, 30);

        RectangleShape singleBtn(Vector2f(250, 50));
        singleBtn.setFillColor(Color::White);
        singleBtn.setPosition(75, 100);

        RectangleShape twoBtn(Vector2f(250, 50));
        twoBtn.setFillColor(Color::White);
        twoBtn.setPosition(75, 170);

        Text singleText("1P vs AI", font, 18);
        singleText.setFillColor(Color::Black);
        singleText.setPosition(110, 115);

        Text twoText("2 Players", font, 18);
        twoText.setFillColor(Color::Black);
        twoText.setPosition(140, 185);

        while (modeWin.isOpen()) {
            Event event;
            while (modeWin.pollEvent(event)) {
                if (event.type == Event::Closed)
                    modeWin.close();
                else if (event.type == Event::MouseButtonPressed) {
                    auto pos = Mouse::getPosition(modeWin);
                    if (singleBtn.getGlobalBounds().contains(Vector2f(pos)))
                        return 1;
                    if (twoBtn.getGlobalBounds().contains(Vector2f(pos)))
                        return 2;
                }
            }

            modeWin.clear(Color(30, 30, 30));
            modeWin.draw(title);
            modeWin.draw(singleBtn);
            modeWin.draw(twoBtn);
            modeWin.draw(singleText);
            modeWin.draw(twoText);
            modeWin.display();
        }

        return 1;
    }

    void displayGameOver(const string& winner) {
        gameOverSound.play();
        RenderWindow gameOverWin(VideoMode(600, 200), "Game Over");

        Text msg("Game Over! Winner: " + winner, font, 14);
        msg.setFillColor(Color::White);
        msg.setPosition(30, 80);

        while (gameOverWin.isOpen()) {
            Event event;
            while (gameOverWin.pollEvent(event)) {
                if (event.type == Event::Closed)
                    gameOverWin.close();
            }
            gameOverWin.clear(Color::Black);
            gameOverWin.draw(msg);
            gameOverWin.display();
        }
    }

    void run() {
        mode = chooseMode();
        player1 = getPlayerName("Enter Player 1 Name:");
        player2 = (mode == 2) ? getPlayerName("Enter Player 2 Name:") : "Computer";

        // Center the score text
        scoreText.setString(to_string(scoreLeft) + " - " + to_string(scoreRight));
        FloatRect textBounds = scoreText.getLocalBounds();
        scoreText.setPosition(WINDOW_WIDTH / 2 - textBounds.width / 2, 10);  // Center the score

        while (window.isOpen()) {
            Event event;
            while (window.pollEvent(event)) {
                if (event.type == Event::Closed)
                    window.close();
            }

            // Controls
            if (Keyboard::isKeyPressed(Keyboard::W)) left.moveUp();
            if (Keyboard::isKeyPressed(Keyboard::S)) left.moveDown();

            if (mode == 2) {
                if (Keyboard::isKeyPressed(Keyboard::Up)) right.moveUp();
                if (Keyboard::isKeyPressed(Keyboard::Down)) right.moveDown();
            }
            else {
                float dy = ball.shape.getPosition().y - right.shape.getPosition().y;
                if (abs(dy) > 20)
                    (dy < 0) ? right.moveUp() : right.moveDown();
            }

            // Update ball
            ball.update();

            // Collision
            if (ball.getBounds().intersects(left.getBounds()) && ball.velocity.x < 0) {
                ball.velocity.x *= -1;
                hitSound.play();
            }

            if (ball.getBounds().intersects(right.getBounds()) && ball.velocity.x > 0) {
                ball.velocity.x *= -1;
                hitSound.play();
            }

            // Scoring
            if (ball.shape.getPosition().x < 0) {
                scoreRight++;
                ball.reset(true);
            }

            if (ball.shape.getPosition().x > WINDOW_WIDTH) {
                scoreLeft++;
                ball.reset(true);
            }

            // Win condition
            if (scoreLeft >= WIN_SCORE || scoreRight >= WIN_SCORE) {
                string winner = (scoreLeft > scoreRight) ? player1 : player2;
                saveScore(player1, scoreLeft);
                saveScore(player2, scoreRight);
                displayGameOver(winner);
                window.close();
            }

            // Render
            scoreText.setString(to_string(scoreLeft) + " - " + to_string(scoreRight));
            window.clear(Color(173, 216, 230));
            window.draw(left.shape);
            window.draw(right.shape);
            window.draw(ball.shape);
            dottedLine();  // Draw the dotted line
            window.draw(scoreText);
            window.display();
        }
    }
};


// Main function
int main() {
    Game game;
    game.run();
    return 0;
}