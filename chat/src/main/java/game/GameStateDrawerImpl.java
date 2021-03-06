package game;

import com.google.gson.Gson;
import dto.BaseDTO;
import dto.GameFinishedDTO;
import dto.StateDTO;
import dto.PlayerDTO;
import dto.mapper.PlayerDTOMapper;
import org.apache.log4j.Logger;
import javax.websocket.Session;
import java.io.IOException;
import java.util.List;
import java.util.Set;

public class GameStateDrawerImpl implements GameStateDrawer {
    private Game game;
    private Set<Session> sessions;
    private static final Logger LOGGER = Logger.getLogger(GameStateDrawerImpl.class);

    public GameStateDrawerImpl(Set<Session> sessions) {
        this.sessions = sessions;
    }

    @Override
    public void draw() {
            List<PlayerDTO> playerDTOs = PlayerDTOMapper.map(game.getPlayers());
            StateDTO messageStateDTO = new StateDTO(playerDTOs, game.getBullets());
            send(messageStateDTO);
    }

    private void send(BaseDTO messageStateDTO) {
        try {
            String jsonMsg = obj2json(messageStateDTO);
            for (Session session : sessions) {
                if (session.isOpen()) {
                    session.getBasicRemote().sendText(jsonMsg);
                } else {
                    LOGGER.warn("Attempt to write to closed session:" + session);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error during sending websocket message to frontend.");
        }
    }


    @Override
    public void drawGameOver() {
        GameFinishedDTO gameOver = new GameFinishedDTO(game.getWinner() != null ? game.getWinner().getName() : null);
        send(gameOver);
    }

    private String obj2json(BaseDTO messageStateDTO) {
        Gson gson = new Gson();
        return gson.toJson(messageStateDTO);
    }

    @Override
    public Game getGame() {
        return game;
    }

    @Override
    public void setGame(Game game) {
        this.game = game;
    }
}
