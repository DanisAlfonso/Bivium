#!/usr/bin/env python3
"""Generar iconos para Bivium"""
from PIL import Image, ImageDraw
import os

def create_icon(size, output_path, bg_color="#E8F4FD"):
    """Crear icono con forma de bifurcación (Y) - símbolo de Bivium"""
    img = Image.new('RGBA', (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Calcular proporciones
    center_x = size // 2
    top_y = int(size * 0.22)
    fork_y = int(size * 0.45)
    left_x = int(size * 0.28)
    right_x = int(size * 0.72)
    bottom_y = int(size * 0.78)
    
    # Grosor de líneas proporcional
    thick_main = max(20, size // 20)
    thick_branch = max(25, size // 18)
    
    # Color principal (azul)
    color_main = (37, 99, 235, 255)  # #2563EB
    color_dark = (30, 64, 175, 255)  # #1E40AF
    
    # Dibujar línea central (parte superior)
    draw.line([(center_x, top_y), (center_x, fork_y)], 
              fill=color_dark, width=thick_main)
    
    # Dibujar bifurcación izquierda
    draw.line([(center_x, fork_y), (left_x, bottom_y)], 
              fill=color_main, width=thick_branch)
    
    # Dibujar bifurcación derecha
    draw.line([(center_x, fork_y), (right_x, bottom_y)], 
              fill=color_main, width=thick_branch)
    
    # Añadir redondeo en las puntas (círculos pequeños)
    radius_tip = thick_branch // 2
    draw.ellipse([center_x - thick_main//2, top_y - thick_main//2,
                  center_x + thick_main//2, top_y + thick_main//2], 
                 fill=color_dark)
    draw.ellipse([left_x - radius_tip, bottom_y - radius_tip,
                  left_x + radius_tip, bottom_y + radius_tip], 
                 fill=color_main)
    draw.ellipse([right_x - radius_tip, bottom_y - radius_tip,
                  right_x + radius_tip, bottom_y + radius_tip], 
                 fill=color_main)
    
    img.save(output_path)
    print(f"✓ Creado: {output_path} ({size}x{size})")

def create_splash_icon(size, output_path):
    """Icono para splash screen (fondo transparente)"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center_x = size // 2
    top_y = int(size * 0.15)
    fork_y = int(size * 0.45)
    left_x = int(size * 0.20)
    right_x = int(size * 0.80)
    bottom_y = int(size * 0.85)
    
    thick_main = max(30, size // 16)
    thick_branch = max(35, size // 14)
    
    color_light = (59, 130, 246, 255)   # #3B82F6
    color_dark = (37, 99, 235, 255)     # #2563EB
    
    # Línea central
    draw.line([(center_x, top_y), (center_x, fork_y)], 
              fill=color_dark, width=thick_main)
    
    # Bifurcaciones
    draw.line([(center_x, fork_y), (left_x, bottom_y)], 
              fill=color_light, width=thick_branch)
    draw.line([(center_x, fork_y), (right_x, bottom_y)], 
              fill=color_light, width=thick_branch)
    
    # Redondeo
    radius_main = thick_main // 2
    radius_branch = thick_branch // 2
    draw.ellipse([center_x - radius_main, top_y - radius_main,
                  center_x + radius_main, top_y + radius_main], 
                 fill=color_dark)
    draw.ellipse([left_x - radius_branch, bottom_y - radius_branch,
                  left_x + radius_branch, bottom_y + radius_branch], 
                 fill=color_light)
    draw.ellipse([right_x - radius_branch, bottom_y - radius_branch,
                  right_x + radius_branch, bottom_y + radius_branch], 
                 fill=color_light)
    
    img.save(output_path)
    print(f"✓ Creado: {output_path} ({size}x{size})")

def create_favicon(size, output_path):
    """Favicon simplificado"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center_x = size // 2
    margin = size // 6
    
    thick = max(6, size // 8)
    color = (37, 99, 235, 255)
    
    # Forma de Y simplificada
    draw.line([(center_x, margin), (center_x, size // 2)], 
              fill=color, width=thick)
    draw.line([(center_x, size // 2), (margin, size - margin)], 
              fill=color, width=thick)
    draw.line([(center_x, size // 2), (size - margin, size - margin)], 
              fill=color, width=thick)
    
    img.save(output_path)
    print(f"✓ Creado: {output_path} ({size}x{size})")

if __name__ == "__main__":
    assets_dir = "assets/images"
    os.makedirs(assets_dir, exist_ok=True)
    
    # Icono principal
    create_icon(1024, f"{assets_dir}/icon.png")
    
    # Splash icon (transparente)
    create_splash_icon(1024, f"{assets_dir}/splash-icon.png")
    
    # Android foreground (icono sin fondo)
    create_splash_icon(512, f"{assets_dir}/android-icon-foreground.png")
    
    # Android background (sólido)
    bg = Image.new('RGBA', (512, 512), (230, 244, 254, 255))
    bg.save(f"{assets_dir}/android-icon-background.png")
    print(f"✓ Creado: {assets_dir}/android-icon-background.png")
    
    # Android monochrome (blanco)
    mono = Image.new('RGBA', (512, 512), (255, 255, 255, 255))
    mono.save(f"{assets_dir}/android-icon-monochrome.png")
    print(f"✓ Creado: {assets_dir}/android-icon-monochrome.png")
    
    # Favicon
    create_favicon(48, f"{assets_dir}/favicon.png")
    
    print("\n✅ Todos los iconos de Bivium creados exitosamente!")
