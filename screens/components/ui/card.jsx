import React from "react";
import "./card.css"; // <-- move the CSS here

const Card = () => {
  return (
    <View className="card">
      <View className="tools">
        <View className="circle">
          <span className="red box"></span>
        </View>
        <View className="circle">
          <span className="yellow box"></span>
        </View>
        <View className="circle">
          <span className="green box"></span>
        </View>
      </View>
      <View className="card__content">
        {/* You can drop your content here */}
      </View>
    </View>
  );
};

export default Card;
