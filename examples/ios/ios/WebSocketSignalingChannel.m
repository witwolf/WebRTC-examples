//
//  WebSocketSignalingChannel.m
//  ios
//
//  Created by witwolf on 12/26/15.
//  Copyright © 2015 witwolf. All rights reserved.
//

#import "WebSocketSignalingChannel.h"
#import "third_party/SocketRocket/SRWebSocket.h"

@implementation WebSocketSignalingChannel{
    SRWebSocket * _webSocket ;
}



-(instancetype)init{
    _webSocket = [[SRWebSocket alloc]init];
    return self;
}

#pragma mark SignalChannel

-(void)sendQueryConfig{
    
}


-(void)sendJoinGroup:(NSString *)groupId{
    
}


-(void)sendLeaveGroup{
    
}

-(void)sendLocal:(NSString *)peerId iceCandidate:(RTCICECandidate *)iceCandidate{
    
}

-(void)sendOffer:(NSString *)peerId sdp:(RTCSessionDescription *)sdp{
    
}

-(void)sendAnswer:(NSString *)peerId sdp:(RTCSessionDescription *)sdp{
    
}

-(void)sendMessage:(NSString *)message{
    
}


@end
