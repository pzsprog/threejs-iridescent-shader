export default /* glsl */`
#ifdef USE_MAP

    float d = clamp(dot(f_normal, normalize(cameraPosition - f_position)), 0.0, 1.0) + cameraPosition.x/30.0;
    vec4 hologram_color = texture2D(hologram, f_uv).rgba;
    vec4 hologram_mask = vec4(colorFunc(d, 0.0), colorFunc(d, 1.0), colorFunc(d, 2.0), 1.0);
    vec4 map_rgba = texture2D( map, vUv ).rgba;
    vec4 texelColor = mix(map_rgba, hologram_mask, hologram_color.a);
	texelColor = mapTexelToLinear(texelColor);
    diffuseColor *= texelColor;

#endif
`;