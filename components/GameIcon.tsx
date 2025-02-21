import { Swords, Target, Gamepad2, Users2 } from "lucide-react";

export const GameIcon = ({ game }: { game: string }) => {
  switch (game) {
    case "chess":
      return <Swords className="w-6 h-6" />;
    case "carrom":
      return <Target className="w-6 h-6" />;
    case "badminton":
      return <Gamepad2 className="w-6 h-6" />;
    default:
      return <Users2 className="w-6 h-6" />;
  }
};