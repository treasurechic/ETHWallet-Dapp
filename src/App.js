import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ConnectAccount } from "./component/connectAccount";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ConnectAccount/>
        
      </header>
    </div>
  );
}

export default App;
