//
//  SignalingChannel.h
//  ios
//
//  Created by witwolf on 12/26/15.
//  Copyright © 2015 witwolf. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "third_party/WebRTC/RTCICECandidate.h"
#import "third_party/WebRTC/RTCSessionDescription.h"

@protocol SignalingChannelDeletage <NSObject>

-(void)remotePeer:(NSString*)peerId sdp:(RTCSessionDescription*)sdp;
-(void)remotePeer:(NSString*)peerId iceCandidate:(RTCICECandidate*)iceCandidate;

-(void)channelClosed;
-(void)channelError;
-(void)channelConnected;

@end

@protocol SignalingChannel <NSObject>

-(void)sendJoinGroup:(NSString *)groupId;
-(void)sendLeaveGroup;
-(void)sendQueryConfig;
-(void)sendOffer:(NSString*)peerId sdp:(RTCSessionDescription*)sdp;
-(void)sendAnswer:(NSString*)peerId sdp:(RTCSessionDescription*)sdp;
-(void)sendLocal:(NSString*)peerId iceCandidate:(RTCICECandidate*)iceCandidate;
-(void)sendMessage:(NSString*)message;

@end
